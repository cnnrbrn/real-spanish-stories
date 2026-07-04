import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { newsSchema, type News } from "@real-spanish-stories/shared";
import { UpdateNewsCommand } from "./update-news.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(UpdateNewsCommand)
export class UpdateNewsHandler implements ICommandHandler<UpdateNewsCommand> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(command: UpdateNewsCommand): Promise<News> {
    const [item] = await this.database
      .update(newsSchema)
      .set({
        ...command.data,
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
