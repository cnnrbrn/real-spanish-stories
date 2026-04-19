import { STORY_STATUS_VALUES } from "@real-spanish-stories/shared";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const updateStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  altTitle: z.string().min(1).max(200).optional(),
  description: z.string().max(160).nullable().optional(),
  level: z.string().optional(),
  audioPath: z.string().optional(),
  audioFilename: z.string().optional(),
  transcription: z.any().optional(),
  videoLink: z.string().optional(),
  isPremium: z.boolean().optional(),
});

const updateStoryStatusSchema = z.object({
  status: z.enum(STORY_STATUS_VALUES),
});

export class UpdateStoryDto extends createZodDto(updateStorySchema) {}
export class UpdateStoryStatusDto extends createZodDto(updateStoryStatusSchema) {}
