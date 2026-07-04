import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { newsSchema, type News } from "@real-spanish-stories/shared";
import { CreateNewsCommand } from "./create-news.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(CreateNewsCommand)
export class CreateNewsHandler implements ICommandHandler<CreateNewsCommand> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(command: CreateNewsCommand): Promise<News> {
    const [item] = await this.database
      .insert(newsSchema)
      .values({
        ...command.data,
        status: "draft",
      })
      .returning();

    return item;
  }
}
