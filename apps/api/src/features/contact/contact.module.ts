import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { ContactController } from "./contact.controller";
import { SubmitContactHandler } from "./submit-contact/submit-contact.handler";

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [ContactController],
  providers: [SubmitContactHandler],
})
export class ContactModule {}
