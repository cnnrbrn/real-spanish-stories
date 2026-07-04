import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { NewsController } from "./news.controller";
import { GetNewsListHandler } from "./get-news-list/get-news-list.handler";
import { GetNewsHandler } from "./get-news/get-news.handler";
import { CreateNewsHandler } from "./create-news/create-news.handler";
import { UpdateNewsHandler } from "./update-news/update-news.handler";
import { UpdateNewsStatusHandler } from "./update-news-status/update-news-status.handler";
import { DeleteNewsHandler } from "./delete-news/delete-news.handler";

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [NewsController],
  providers: [
    GetNewsListHandler,
    GetNewsHandler,
    CreateNewsHandler,
    UpdateNewsHandler,
    UpdateNewsStatusHandler,
    DeleteNewsHandler,
  ],
})
export class NewsModule {}
