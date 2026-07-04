import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { newsSchema } from "@real-spanish-stories/shared";
import { DeleteNewsCommand } from "./delete-news.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(DeleteNewsCommand)
export class DeleteNewsHandler implements ICommandHandler<DeleteNewsCommand> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(command: DeleteNewsCommand): Promise<void> {
    const [item] = await this.database
      .delete(newsSchema)
      .where(eq(newsSchema.id, command.id))
      .returning({ id: newsSchema.id });

    if (!item) {
      throw new NotFoundException(`News item with id ${command.id} not found`);
    }
  }
}
