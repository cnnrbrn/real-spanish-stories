import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetNewsListQuery } from "./get-news-list/get-news-list.query";
import { GetNewsQuery } from "./get-news/get-news.query";
import { CreateNewsCommand } from "./create-news/create-news.command";
import { UpdateNewsCommand } from "./update-news/update-news.command";
import { UpdateNewsStatusCommand } from "./update-news-status/update-news-status.command";
import { DeleteNewsCommand } from "./delete-news/delete-news.command";
import { CreateNewsDto, UpdateNewsDto, UpdateNewsStatusDto } from "./news.dto";

@Controller("news")
export class NewsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
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
}
