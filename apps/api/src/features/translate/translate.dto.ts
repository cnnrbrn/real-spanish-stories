import {
  glossRequestSchema,
  glossResponseSchema,
  translationRequestSchema,
  translationResponseSchema,
} from "@real-spanish-stories/shared";
import { createZodDto } from "nestjs-zod";

export class TranslationRequestDto extends createZodDto(translationRequestSchema) {}
export class TranslationResponseDto extends createZodDto(translationResponseSchema) {}

export class GlossRequestDto extends createZodDto(glossRequestSchema) {}
export class GlossResponseDto extends createZodDto(glossResponseSchema) {}
