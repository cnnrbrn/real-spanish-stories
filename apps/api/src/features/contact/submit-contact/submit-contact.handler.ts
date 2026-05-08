import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { contactTable } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { SubmitContactCommand } from "./submit-contact.command";

@CommandHandler(SubmitContactCommand)
export class SubmitContactHandler implements ICommandHandler<SubmitContactCommand> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{ contact: typeof contactTable }>,
  ) {}

  async execute(command: SubmitContactCommand): Promise<void> {
    if (command.website) return;

    await this.db.insert(contactTable).values({
      name: command.name,
      email: command.email,
      message: command.message,
    });
  }
}
