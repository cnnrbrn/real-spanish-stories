import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import {
  storyDetailSchema,
  storySchema,
  STORY_LEVEL_VALUES,
} from "@real-spanish-stories/shared";

export class StoryDto extends createZodDto(storySchema) {}

export class StoryDetailDto extends createZodDto(storyDetailSchema) {}

const themeParamSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export class ThemeParamDto extends createZodDto(themeParamSchema) {}

const getStoriesQuerySchema = z.object({
  level: z
    .union([z.enum(STORY_LEVEL_VALUES), z.array(z.enum(STORY_LEVEL_VALUES))])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(),
});

export class GetStoriesQueryDto extends createZodDto(getStoriesQuerySchema) {}
