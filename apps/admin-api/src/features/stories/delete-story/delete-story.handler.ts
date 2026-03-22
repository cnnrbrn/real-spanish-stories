import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { storiesSchema } from "@real-spanish-stories/shared";
import { DeleteStoryCommand } from "./delete-story.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(DeleteStoryCommand)
export class DeleteStoryHandler
  implements ICommandHandler<DeleteStoryCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute(command: DeleteStoryCommand): Promise<void> {
    const [story] = await this.database
      .delete(storiesSchema)
      .where(eq(storiesSchema.id, command.id))
      .returning({ id: storiesSchema.id });

    if (!story) {
      throw new NotFoundException(`Story with id ${command.id} not found`);
    }
  }
}
