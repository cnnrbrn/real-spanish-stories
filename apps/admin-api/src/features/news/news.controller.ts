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
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { Response } from "express";
import { newsPdfFilename, type News } from "@real-spanish-stories/shared";
import { StorageService } from "src/storage/storage.service";
import { GetNewsListQuery } from "./get-news-list/get-news-list.query";
import { GetNewsQuery } from "./get-news/get-news.query";
import { CreateNewsCommand } from "./create-news/create-news.command";
import { UpdateNewsCommand } from "./update-news/update-news.command";
import { UpdateNewsStatusCommand } from "./update-news-status/update-news-status.command";
import { DeleteNewsCommand } from "./delete-news/delete-news.command";
import { CreateNewsPdfCommand } from "./create-news-pdf/create-news-pdf.command";
import { DeleteNewsPdfCommand } from "./delete-news-pdf/delete-news-pdf.command";
import { CreateNewsDto, UpdateNewsDto, UpdateNewsStatusDto } from "./news.dto";

@Controller("news")
export class NewsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  getNewsList() {
    return this.queryBus.execute(new GetNewsListQuery());
  }

  @Get(":id")
  getNews(@Param("id", ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetNewsQuery(id));
  }

  @Post()
  createNews(@Body() dto: CreateNewsDto) {
    return this.commandBus.execute(new CreateNewsCommand(dto));
  }

  @Patch(":id")
  updateNews(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
  ) {
    return this.commandBus.execute(new UpdateNewsCommand(id, dto));
  }

  @Patch(":id/status")
  updateNewsStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateNewsStatusDto,
  ) {
    return this.commandBus.execute(new UpdateNewsStatusCommand(id, dto));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNews(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteNewsCommand(id));
  }

  @Post(":id/create-pdf")
  createNewsPdf(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new CreateNewsPdfCommand(id));
  }

  @Delete(":id/pdf")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNewsPdf(@Param("id", ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteNewsPdfCommand(id));
  }

  @Get(":id/pdf")
  async downloadPdf(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const news: News = await this.queryBus.execute(new GetNewsQuery(id));
    if (!news.pdfPath) {
      throw new NotFoundException(`News ${id} has no PDF`);
    }
    const filename = newsPdfFilename(news);
    const url = await this.storageService.getPresignedUrl(
      news.pdfPath,
      undefined,
      `attachment; filename="${filename}"`,
    );
    res.redirect(url);
  }
}
