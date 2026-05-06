import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { VIDEO_STATUS_VALUES } from "@real-spanish-stories/shared";

const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  altTitle: z.string().min(1).max(200),
  level: z.string(),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  altTitle: z.string().min(1).max(200).optional(),
  level: z.string().optional(),
  status: z.enum(VIDEO_STATUS_VALUES).optional(),
  transcriptionJson: z.string().optional(),
  sectionsJson: z.string().optional(),
  languageTaggedJson: z.string().optional(),
  transcriptionMarkdown: z.string().optional(),
  videoPath: z.string().optional(),
  errorMessage: z.string().optional(),
});

const detectSectionsSchema = z.object({
  useSpanishHeadings: z.boolean(),
  skipEnglishTitle: z.boolean(),
});

export class CreateVideoDto extends createZodDto(createVideoSchema) {}
export class UpdateVideoDto extends createZodDto(updateVideoSchema) {}
export class DetectSectionsDto extends createZodDto(detectSectionsSchema) {}
