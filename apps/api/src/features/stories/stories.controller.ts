import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Response } from "express";
import { OptionalAuth, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { GetStoriesQuery } from "./get-stories/get-stories.query";
import { GetStoriesGroupedQuery } from "./get-stories-grouped/get-stories-grouped.query";
import { GetStoryQuery } from "./get-story/get-story.query";
import { GetStoryPdfQuery } from "./get-story-pdf/get-story-pdf.query";
import { RequestAudioDownloadCommand } from "./request-audio-download/request-audio-download.command";
import { RequestAudioPlayCommand } from "./request-audio-play/request-audio-play.command";
import { GetStoriesQueryDto, ThemeParamDto } from "./stories.dto";

@Controller("stories")
export class StoriesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @OptionalAuth()
  @Get()
  getStories(@Query() { level }: GetStoriesQueryDto) {
    return this.queryBus.execute(new GetStoriesQuery(level));
  }

  @OptionalAuth()
  @Get("grouped")
  getStoriesGrouped() {
    return this.queryBus.execute(new GetStoriesGroupedQuery());
  }

  @OptionalAuth()
  @Get(":slug")
  getStory(@Param("slug") slug: string) {
    return this.queryBus.execute(new GetStoryQuery(slug));
  }

  @Get(":id/audio")
  async getStoryAudio(
    @Param("id", ParseIntPipe) id: number,
    @Session() session: UserSession,
  ): Promise<{ url: string }> {
    const url = await this.commandBus.execute<
      RequestAudioDownloadCommand,
      string
    >(new RequestAudioDownloadCommand(session.user.id, id));
    return { url };
  }

  @Get(":id/audio/play")
  async playStoryAudio(
    @Param("id", ParseIntPipe) id: number,
    @Session() session: UserSession,
  ): Promise<{ url: string }> {
    const url = await this.commandBus.execute<
      RequestAudioPlayCommand,
      string
    >(new RequestAudioPlayCommand(session.user.id, id));
    return { url };
  }

  @Get(":id/pdf/:theme")
  async getStoryPdf(
    @Param("id", ParseIntPipe) id: number,
    @Param() { theme }: ThemeParamDto,
    @Session() session: UserSession,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.queryBus.execute(
      new GetStoryPdfQuery(session.user.id, id, theme),
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  }
}
