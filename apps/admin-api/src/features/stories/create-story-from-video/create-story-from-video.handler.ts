import { ConflictException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  createSlug,
  storiesSchema,
  type Story,
} from "@real-spanish-stories/shared";
import { videosSchema } from "@real-spanish-stories/shared";
import { CreateStoryFromVideoCommand } from "./create-story-from-video.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(CreateStoryFromVideoCommand)
export class CreateStoryFromVideoHandler
  implements ICommandHandler<CreateStoryFromVideoCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: CreateStoryFromVideoCommand): Promise<Story> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(`Video with id ${command.videoId} not found`);
    }

    if (!video.languageTaggedJson) {
      throw new NotFoundException(
        `Video ${command.videoId} has no language-tagged transcription`,
      );
    }

    const [existing] = await this.database
      .select({ id: storiesSchema.id })
      .from(storiesSchema)
      .where(eq(storiesSchema.videoId, command.videoId))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Story already exists for video ${command.videoId}`,
      );
    }

    const transcription = JSON.parse(video.languageTaggedJson);

    const [story] = await this.database
      .insert(storiesSchema)
      .values({
        videoId: command.videoId,
        title: video.title,
        altTitle: video.altTitle,
        slug: createSlug(video.altTitle, video.level ?? ''),
        level: video.level,
        audioPath: video.audioPath,
        audioFilename: video.audioFilename,
        transcription,
        status: "draft",
        isPremium: false,
      })
      .returning();

    return story;
  }
}
