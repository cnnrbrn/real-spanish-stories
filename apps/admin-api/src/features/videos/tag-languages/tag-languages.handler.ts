import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import type { VideoStatus } from "@real-spanish-stories/shared";
import { TagLanguagesCommand } from "./tag-languages.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { tagLanguages } from "../language-tagging.utils";

const ALLOWED_STATUSES: VideoStatus[] = ["sectioned", "language_tagged", "completed"];

@CommandHandler(TagLanguagesCommand)
export class TagLanguagesHandler
  implements ICommandHandler<TagLanguagesCommand>
{
  private readonly openai: OpenAI;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
    configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: configService.getOrThrow("OPENAI_API_KEY"),
    });
  }

  async execute(command: TagLanguagesCommand): Promise<Video> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.videoId} not found`,
      );
    }

    if (!video.sectionsJson) {
      throw new BadRequestException(
        "Video has no sections. Run section detection first.",
      );
    }

    if (!ALLOWED_STATUSES.includes(video.status)) {
      throw new BadRequestException(
        `Video must be in 'sectioned', 'language_tagged', or 'completed' status, currently: ${video.status}`,
      );
    }

    // Set status to language_tagging
    await this.database
      .update(videosSchema)
      .set({ status: "language_tagging", updatedAt: new Date() })
      .where(eq(videosSchema.id, command.videoId));

    try {
      const languageTaggedJson = await tagLanguages(
        video.sectionsJson,
        this.openai,
      );

      const [updated] = await this.database
        .update(videosSchema)
        .set({
          languageTaggedJson,
          status: "language_tagged",
          errorMessage: null,
          updatedAt: new Date(),
        })
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
          errorMessage: `Language tagging failed: ${message}`,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      return failed;
    }
  }
}
