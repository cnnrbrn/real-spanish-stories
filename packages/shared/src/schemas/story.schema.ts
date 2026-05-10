import { z } from "zod";
import { STORY_LEVEL_VALUES } from "../constants/story-levels.js";
import { STORY_STATUS_VALUES } from "../constants/story-status.js";
import { transcriptionSchema } from "./transcription.schema.js";

export const storySchema = z.object({
  id: z.number(),
  title: z.string(),
  altTitle: z.string(),
  description: z.string().max(160).nullable(),
  slug: z.string(),
  videoLink: z.string().nullable(),
  level: z.enum(STORY_LEVEL_VALUES),
  status: z.enum(STORY_STATUS_VALUES),
  isPremium: z.boolean(),
  audioFilename: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type StoryResponse = z.infer<typeof storySchema>;

export const storyDetailSchema = storySchema.extend({
  summary: z.string().nullable(),
  audioPath: z.string().nullable(),
  pdfLightPath: z.string().nullable(),
  pdfDarkPath: z.string().nullable(),
  transcription: transcriptionSchema,
  siblings: z.array(storySchema),
});

export type StoryDetail = z.infer<typeof storyDetailSchema>;

export const storyUpdateSchema = storyDetailSchema.pick({
  title: true,
  altTitle: true,
  level: true,
  description: true,
  summary: true,
  audioPath: true,
  audioFilename: true,
  videoLink: true,
  isPremium: true,
}).partial().extend({
  transcription: z.string().optional(),
});


export type StoryUpdate = z.infer<typeof storyUpdateSchema>;

export interface StoryStatusUpdate {
  status: "draft" | "published";
}

export const storyLevelLinkSchema = z.object({
  level: z.enum(STORY_LEVEL_VALUES),
  slug: z.string(),
  videoLink: z.string().nullable(),
});

export const storyGroupSchema = z.object({
  altTitle: z.string(),
  levels: z.array(storyLevelLinkSchema),
});

export type StoryGroup = z.infer<typeof storyGroupSchema>;
