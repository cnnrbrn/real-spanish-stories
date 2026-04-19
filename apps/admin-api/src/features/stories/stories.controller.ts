import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { Response } from "express";
import { StorageService } from "src/storage/storage.service";
import { GetStoriesQuery } from "./get-stories/get-stories.query";
import { GetStoryQuery } from "./get-story/get-story.query";
import { GetStoryByVideoQuery } from "./get-story-by-video/get-story-by-video.query";
import { CreateStoryFromVideoCommand } from "./create-story-from-video/create-story-from-video.command";
import { UpdateStoryCommand } from "./update-story/update-story.command";
import { UpdateStoryStatusCommand } from "./update-story-status/update-story-status.command";
import { DeleteStoryCommand } from "./delete-story/delete-story.command";
import { UploadAudioToStoryCommand } from "./upload-audio-to-story/upload-audio-to-story.command";
import { CreateStoryPdfsCommand } from "./create-story-pdfs/create-story-pdfs.command";
import { DeleteStoryPdfsCommand } from "./delete-story-pdfs/delete-story-pdfs.command";
import { GenerateDescriptionCommand } from "./generate-description/generate-description.command";
import { UpdateStoryDto, UpdateStoryStatusDto } from "./stories.dto";

@Controller("stories")
export class StoriesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  getStories() {
    return this.queryBus.execute(new GetStoriesQuery());
  }

  @Get(":id")
  getStory(@Param("id", ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetStoryQuery(id));
  }

  @Get("by-video/:videoId")
  getStoryByVideo(@Param("videoId", ParseIntPipe) videoId: number) {
    return this.queryBus.execute(new GetStoryByVideoQuery(videoId));
  }

  @Post("from-video/:videoId")
  createStoryFromVideo(@Param("videoId", ParseIntPipe) videoId: number) {
    return this.commandBus.execute(new CreateStoryFromVideoCommand(videoId));
  }

  @Patch(":id")
  updateStory(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStoryDto,
  ) {
    return this.commandBus.execute(new UpdateStoryCommand(id, dto));
  }

  @Patch(":id/status")
  updateStoryStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStoryStatusDto,
  ) {
    return this.commandBus.execute(new UpdateStoryStatusCommand(id, dto));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStory(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteStoryCommand(id));
  }

  @Post(":id/upload-audio")
  @UseInterceptors(FileInterceptor("audioFile"))
  uploadAudioToStory(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    return this.commandBus.execute(new UploadAudioToStoryCommand(id, file));
  }

  @Post(":id/generate-description")
  generateDescription(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new GenerateDescriptionCommand(id));
  }

  @Post(":id/create-pdfs")
  createStoryPdfs(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new CreateStoryPdfsCommand(id));
  }

  @Delete(":id/pdfs")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStoryPdfs(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteStoryPdfsCommand(id));
  }

  @Get(":id/pdf-light")
  async downloadPdfLight(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const story = await this.queryBus.execute(new GetStoryQuery(id));
    if (!story.pdfLightPath) {
      throw new NotFoundException(`Story ${id} has no light PDF`);
    }
    const url = await this.storageService.getPresignedUrl(story.pdfLightPath);
    res.redirect(url);
  }

  @Get(":id/pdf-dark")
  async downloadPdfDark(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const story = await this.queryBus.execute(new GetStoryQuery(id));
    if (!story.pdfDarkPath) {
      throw new NotFoundException(`Story ${id} has no dark PDF`);
    }
    const url = await this.storageService.getPresignedUrl(story.pdfDarkPath);
    res.redirect(url);
  }

  @Get(":id/audio")
  async downloadAudio(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const story = await this.queryBus.execute(new GetStoryQuery(id));
    if (!story.audioPath) {
      throw new NotFoundException(`Story ${id} has no audio`);
    }
    const url = await this.storageService.getPresignedUrl(story.audioPath);
    res.redirect(url);
  }
}
