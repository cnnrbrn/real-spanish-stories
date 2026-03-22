import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { storiesSchema, type Story } from "@real-spanish-stories/shared";
import { UpdateStoryCommand } from "./update-story.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(UpdateStoryCommand)
export class UpdateStoryHandler
  implements ICommandHandler<UpdateStoryCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute(command: UpdateStoryCommand): Promise<Story> {
    const [story] = await this.database
      .update(storiesSchema)
      .set({
        ...command.data,
        updatedAt: new Date(),
      })
      .where(eq(storiesSchema.id, command.id))
      .returning();

    if (!story) {
      throw new NotFoundException(`Story with id ${command.id} not found`);
    }

    return story;
  }
}
