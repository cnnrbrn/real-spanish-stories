import { z } from "zod";
import { STORY_STATUS_VALUES } from "../constants/story-status.js";
import { transcriptionSchema } from "./transcription.schema.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const newsResponseSchema = z.object({
  id: z.number(),
  date: z.string(),
  title: z.string().nullable(),
  videoLink: z.string().nullable(),
  pdfPath: z.string().nullable(),
  status: z.enum(STORY_STATUS_VALUES),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type NewsResponse = z.infer<typeof newsResponseSchema>;

export const newsDetailSchema = newsResponseSchema.extend({
  metaDescription: z.string().max(160).nullable(),
  summary: z.string().nullable(),
  transcript: z.string().nullable(),
  transcription: transcriptionSchema.nullable(),
});

export type NewsDetail = z.infer<typeof newsDetailSchema>;

export const newsCreateSchema = z.object({
  date: z.string().regex(DATE_PATTERN),
  title: z.string().max(200).optional(),
  metaDescription: z.string().max(160).optional(),
  summary: z.string().optional(),
  videoLink: z.string().url().optional(),
  transcript: z.string().optional(),
});

export type NewsCreate = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = newsCreateSchema.partial();

export type NewsUpdate = z.infer<typeof newsUpdateSchema>;

export interface NewsStatusUpdate {
  status: "draft" | "published";
}
