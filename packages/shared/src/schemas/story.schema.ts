import { z } from "zod";
import { STORY_LEVEL_VALUES } from "../constants/story-levels.js";
import { STORY_STATUS_VALUES } from "../constants/story-status.js";
import { transcriptionSchema } from "./transcription.schema.js";

export const storySchema = z.object({
  id: z.number(),
  title: z.string(),
  altTitle: z.string(),
  videoLink: z.string().nullable(),
  level: z.enum(STORY_LEVEL_VALUES),
  status: z.enum(STORY_STATUS_VALUES),
  isPremium: z.boolean(),
  createdAt: z.coerce.date(),
});

export type StoryResponse = z.infer<typeof storySchema>;

export const storyDetailSchema = storySchema.extend({
  audioPath: z.string().nullable(),
  audioFilename: z.string().nullable(),
  pdfLightPath: z.string().nullable(),
  pdfDarkPath: z.string().nullable(),
  transcription: transcriptionSchema,
});

export type StoryDetail = z.infer<typeof storyDetailSchema>;
