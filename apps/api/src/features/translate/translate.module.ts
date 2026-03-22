import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { TranslateController } from "./translate.controller";
import { TranslatePhraseHandler } from "./translate-phrase/translate-phrase.handler";

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [TranslateController],
  providers: [TranslatePhraseHandler],
})
export class TranslateModule {}
