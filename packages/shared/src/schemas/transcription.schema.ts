import { z } from "zod";
import { SECTION_TYPE_VALUES } from "../constants/section-types.js";

const rawTranscriptionWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

export type RawTranscriptionWord = z.infer<typeof rawTranscriptionWordSchema>;

const transcriptionWordSchema = rawTranscriptionWordSchema.extend({
  language: z.string(),
  lineBreak: z.boolean().optional(),
});

export type TranscriptionWord = z.infer<typeof transcriptionWordSchema>;

const transcriptionSectionSchema = z.object({
  type: z.enum(SECTION_TYPE_VALUES),
  start_time: z.number(),
  end_time: z.number(),
  words: z.array(transcriptionWordSchema),
  static: z.boolean().optional(),
  text: z.string().optional(),
});

export type TranscriptionSection = z.infer<typeof transcriptionSectionSchema>;

export const transcriptionSchema = z.object({
  sections: z.array(transcriptionSectionSchema),
});

export type Transcription = z.infer<typeof transcriptionSchema>;

export interface TranscriptionResult {
  text: string;
  words: RawTranscriptionWord[];
  segments: Record<string, unknown>[];
}
