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

    const [video] = await this.database
      .insert(videosSchema)
      .values({
        title: command.title,
        altTitle: command.altTitle,
        level: command.level,
        status: "draft",
        useSpanishHeadings: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return video;
  }
}
