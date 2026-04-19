import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { Response } from "express";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { GetStoriesQuery } from "./get-stories/get-stories.query";
import { GetStoryQuery } from "./get-story/get-story.query";
import { GetStoryAudioQuery } from "./get-story-audio/get-story-audio.query";
import { GetStoryPdfQuery } from "./get-story-pdf/get-story-pdf.query";
import { GetStoriesQueryDto, ThemeParamDto } from "./stories.dto";

@Controller("stories")
export class StoriesController {
  constructor(private readonly queryBus: QueryBus) {}

  @AllowAnonymous()
  @Get()
  getStories(@Query() { level }: GetStoriesQueryDto) {
    return this.queryBus.execute(new GetStoriesQuery(level));
  }

  @AllowAnonymous()
  @Get(":slug")
  getStory(@Param("slug") slug: string) {
    return this.queryBus.execute(new GetStoryQuery(slug));
  }

  @AllowAnonymous()
  @Get(":id/audio")
  async getStoryAudio(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.queryBus.execute(
      new GetStoryAudioQuery(id),
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  }

  @AllowAnonymous()
  @Get(":id/pdf/:theme")
  async getStoryPdf(
    @Param("id", ParseIntPipe) id: number,
    @Param() { theme }: ThemeParamDto,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.queryBus.execute(
      new GetStoryPdfQuery(id, theme),
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  }
}
