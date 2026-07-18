import { ConflictException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  newsSchema,
  videosSchema,
  type News,
} from "@real-spanish-stories/shared";
import { CreateNewsFromVideoCommand } from "./create-news-from-video.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

const POSTGRES_UNIQUE_VIOLATION = "23505";

@CommandHandler(CreateNewsFromVideoCommand)
export class CreateNewsFromVideoHandler
  implements ICommandHandler<CreateNewsFromVideoCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: CreateNewsFromVideoCommand): Promise<News> {
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
      .select({ id: newsSchema.id })
      .from(newsSchema)
      .where(eq(newsSchema.videoId, command.videoId))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `A news episode already exists for video ${command.videoId}`,
      );
    }

    const transcription = JSON.parse(video.languageTaggedJson);
    // News is identified by date, not title, so we do not copy the video title.
    // Default to today; the admin sets the real date on the edit form afterwards.
    const today = new Date().toISOString().slice(0, 10);

    try {
      const [news] = await this.database
        .insert(newsSchema)
        .values({
          date: today,
          videoId: command.videoId,
          transcription,
          status: "draft",
        })
        .returning();

      return news;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          `A news episode already exists for ${today}. Open that episode, or free up the date, before creating a new one.`,
        );
      }
      throw error;
    }
  }
}
