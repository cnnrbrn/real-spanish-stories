import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectQueue } from "@nestjs/bullmq";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Queue } from "bullmq";
import type { VideoStatus } from "@real-spanish-stories/shared";
import { GenerateVideoCommand } from "./generate-video.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";

export interface VideoGenerationJobData {
  videoId: number;
  title: string;
  languageTaggedJson: string;
  audioPath: string;
  draftMode: boolean;
}

const ALLOWED_STATUSES: VideoStatus[] = ["language_tagged", "completed", "failed"];

@CommandHandler(GenerateVideoCommand)
export class GenerateVideoHandler
  implements ICommandHandler<GenerateVideoCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
    @InjectQueue("video-generation")
    private readonly videoGenerationQueue: Queue<VideoGenerationJobData>,
  ) {}

  async execute(command: GenerateVideoCommand): Promise<Video> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.videoId} not found`,
      );
    }

    if (!video.languageTaggedJson) {
      throw new BadRequestException(
        "Video has no language-tagged data. Run language tagging first.",
      );
    }

    if (!video.audioPath) {
      throw new BadRequestException("Video has no audio file.");
    }

    if (!ALLOWED_STATUSES.includes(video.status)) {
      throw new BadRequestException(
        `Video must be in 'language_tagged', 'completed', or 'failed' status, currently: ${video.status}`,
      );
    }

    // Set status to generating
    await this.database
      .update(videosSchema)
      .set({
        status: "generating",
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(videosSchema.id, command.videoId));

    try {
      // Publish job to video-generation queue (consumed by Python worker)
      await this.videoGenerationQueue.add("generate", {
        videoId: video.id,
        title: video.title,
        languageTaggedJson: video.languageTaggedJson,
        audioPath: video.audioPath,
        draftMode: command.draftMode,
      });

      const [updated] = await this.database
        .update(videosSchema)
        .set({ updatedAt: new Date() })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      return updated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      const [failed] = await this.database
        .update(videosSchema)
        .set({
          status: "failed",
          errorMessage: `Video generation failed to enqueue: ${message}`,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      return failed;
    }
  }
}
