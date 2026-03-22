import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import {
  storyDetailSchema,
  storySchema,
} from "@real-spanish-stories/shared";

export class StoryDto extends createZodDto(storySchema) {}

export class StoryDetailDto extends createZodDto(storyDetailSchema) {}

const themeParamSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export class ThemeParamDto extends createZodDto(themeParamSchema) {}
