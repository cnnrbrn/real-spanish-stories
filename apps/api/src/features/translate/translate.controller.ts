import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OptionalAuth } from "@thallesp/nestjs-better-auth";
import { TranslatePhraseCommand } from "./translate-phrase/translate-phrase.command";
import { TranslateGlossCommand } from "./translate-gloss/translate-gloss.command";
import { ZodResponse } from "nestjs-zod";
import {
  GlossRequestDto,
  GlossResponseDto,
  TranslationRequestDto,
  TranslationResponseDto,
} from "./translate.dto";

@ApiTags("translate")
@OptionalAuth()
@Controller("translate")
export class TranslateController {
  constructor(private readonly commandBus: CommandBus) {}
  @Post("word")
  @ZodResponse({ type: TranslationResponseDto })
  @ApiOperation({ summary: "Translate a word or phrase in context" })
  translateWord(@Body() body: TranslationRequestDto) {
    return this.commandBus.execute(
      new TranslatePhraseCommand(body.phrase, body.storyId, body.newsId),
    );
  }

  @Post("gloss")
  @ZodResponse({ type: GlossResponseDto })
  @ApiOperation({ summary: "Fast machine-translation gloss for a phrase (context-free)" })
  translateGloss(@Body() body: GlossRequestDto) {
    return this.commandBus.execute(new TranslateGlossCommand(body.phrase));
  }
}
