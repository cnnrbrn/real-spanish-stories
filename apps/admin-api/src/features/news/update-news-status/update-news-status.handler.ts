import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { newsSchema, type News } from "@real-spanish-stories/shared";
import { UpdateNewsStatusCommand } from "./update-news-status.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(UpdateNewsStatusCommand)
export class UpdateNewsStatusHandler
  implements ICommandHandler<UpdateNewsStatusCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(command: UpdateNewsStatusCommand): Promise<News> {
    const [item] = await this.database
      .update(newsSchema)
      .set({
        status: command.data.status,
        updatedAt: new Date(),
      })
      .where(eq(newsSchema.id, command.id))
      .returning();

    if (!item) {
      throw new NotFoundException(`News item with id ${command.id} not found`);
    }

    return item;
  }
}
