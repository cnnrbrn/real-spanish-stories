import { z } from "zod";
import { STORY_STATUS_VALUES } from "../constants/story-status.js";

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
  transcript: z.string().nullable(),
});

export type NewsDetail = z.infer<typeof newsDetailSchema>;

export const newsCreateSchema = z.object({
  date: z.string().regex(DATE_PATTERN),
  title: z.string().max(200).optional(),
  videoLink: z.string().url().optional(),
  transcript: z.string().optional(),
});

export type NewsCreate = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = newsCreateSchema.partial();

export type NewsUpdate = z.infer<typeof newsUpdateSchema>;

export interface NewsStatusUpdate {
  status: "draft" | "published";
}
