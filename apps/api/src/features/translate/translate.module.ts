import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { TranslateController } from "./translate.controller";
import { TranslatePhraseHandler } from "./translate-phrase/translate-phrase.handler";
import { TranslateGlossHandler } from "./translate-gloss/translate-gloss.handler";

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [TranslateController],
  providers: [TranslatePhraseHandler, TranslateGlossHandler],
})
export class TranslateModule {}
