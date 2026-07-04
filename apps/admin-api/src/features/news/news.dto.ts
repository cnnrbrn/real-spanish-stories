import {
  newsCreateSchema,
  newsUpdateSchema,
  STORY_STATUS_VALUES,
} from "@real-spanish-stories/shared";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const updateNewsStatusSchema = z.object({
  status: z.enum(STORY_STATUS_VALUES),
});

export class CreateNewsDto extends createZodDto(newsCreateSchema) {}
export class UpdateNewsDto extends createZodDto(newsUpdateSchema) {}
export class UpdateNewsStatusDto extends createZodDto(updateNewsStatusSchema) {}
