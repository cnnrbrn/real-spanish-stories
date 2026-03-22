import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const updateStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  altTitle: z.string().min(1).max(200).optional(),
  level: z.string().optional(),
  audioPath: z.string().optional(),
  audioFilename: z.string().optional(),
  transcription: z.any().optional(),
  videoLink: z.string().optional(),
  isPremium: z.boolean().optional(),
});

const updateStoryStatusSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export class UpdateStoryDto extends createZodDto(updateStorySchema) {}
export class UpdateStoryStatusDto extends createZodDto(updateStoryStatusSchema) {}
