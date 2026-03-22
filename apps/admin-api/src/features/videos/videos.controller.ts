import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query,
  Res, UploadedFile, UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { Response } from "express";
import { GetVideosQuery } from "./get-videos/get-videos.query";
import { GetVideoQuery } from "./get-video/get-video.query";
import { CreateVideoCommand } from "./create-video/create-video.command";
import { UpdateVideoCommand } from "./update-video/update-video.command";
import { DeleteVideoCommand } from "./delete-video/delete-video.command";
import { UploadAudioCommand } from "./upload-audio/upload-audio.command";
import { ExportSubtitleQuery } from "./export-subtitle/export-subtitle.query";
import type { ExportSubtitleResult } from "./export-subtitle/export-subtitle.query";
import { ImportSubtitleCommand } from "./import-subtitle/import-subtitle.command";
import { DetectSectionsCommand } from "./detect-sections/detect-sections.command";
import { TagLanguagesCommand } from "./tag-languages/tag-languages.command";
import { GenerateVideoCommand } from "./generate-video/generate-video.command";
import { CreateVideoDto, UpdateVideoDto } from "./videos.dto";

@Controller("videos")
export class VideosController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getVideos() {
    return this.queryBus.execute(new GetVideosQuery());
  }

  @Get(":id")
  getVideo(@Param("id", ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetVideoQuery(id));
  }

  @Post()
  createVideo(@Body() dto: CreateVideoDto) {
    return this.commandBus.execute(
      new CreateVideoCommand(dto.title, dto.altTitle, dto.level),
    );
  }

  @Patch(":id")
  updateVideo(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.commandBus.execute(new UpdateVideoCommand(id, dto));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVideo(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteVideoCommand(id));
  }

  @Get(":id/transcription-subtitle")
  async exportSubtitle(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result: ExportSubtitleResult = await this.queryBus.execute(
      new ExportSubtitleQuery(id),
    );
    res
      .set({
        "Content-Type": "text/x-ssa; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      })
      .send(result.content);
  }

  @Post(":id/transcription-subtitle")
  @UseInterceptors(FileInterceptor("subtitleFile"))
  importSubtitle(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const assContent = file.buffer.toString("utf-8");
    return this.commandBus.execute(new ImportSubtitleCommand(id, assContent));
  }

  @Post(":id/detect-sections")
  detectSections(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DetectSectionsCommand(id));
  }

  @Post(":id/tag-languages")
  tagLanguages(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new TagLanguagesCommand(id));
  }

  @Post(":id/generate-video")
  generateVideo(
    @Param("id", ParseIntPipe) id: number,
    @Query("draftMode", ParseBoolPipe) draftMode: boolean,
  ) {
    return this.commandBus.execute(new GenerateVideoCommand(id, draftMode));
  }

  @Post(":id/upload-audio")
  @UseInterceptors(FileInterceptor("audioFile"))
  uploadAudio(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Query("transcriptionOption") transcriptionOption: string,
    @Query("useSpanishHeadings", ParseBoolPipe) useSpanishHeadings: boolean,
    @Query("fixTimestamps", ParseBoolPipe) fixTimestamps: boolean,
  ) {
    return this.commandBus.execute(
      new UploadAudioCommand(id, file, transcriptionOption, useSpanishHeadings, fixTimestamps),
    );
  }
}
