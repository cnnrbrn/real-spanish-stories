import { ConflictException, Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CreateVideoCommand } from "./create-video.command";
import type { Video } from "@real-spanish-stories/shared";
import { videosSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: CreateVideoCommand): Promise<Video> {
    // News videos are identified by date, not by title/level, so the
    // (altTitle, level) uniqueness check only applies to levelled content.
    if (command.level !== null) {
      const existing = await this.database
        .select({ id: videosSchema.id })
        .from(videosSchema)
        .where(and(
          eq(videosSchema.altTitle, command.altTitle),
          eq(videosSchema.level, command.level),
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictException(
          "A video with this title and level already exists",
        );
      }
    }

    const [video] = await this.database
      .insert(videosSchema)
      .values({
        title: command.title,
        altTitle: command.altTitle,
        level: command.level,
        contentType: command.contentType,
        status: "draft",
        useSpanishHeadings: false,
        skipEnglishTitle: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return video;
  }
}
