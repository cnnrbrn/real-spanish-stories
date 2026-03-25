import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CreateVideoCommand } from "./create-video.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
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
