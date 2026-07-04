import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { NewsController } from "./news.controller";
import { GetNewsHandler } from "./get-news/get-news.handler";
import { GetNewsByDateHandler } from "./get-news-by-date/get-news-by-date.handler";

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [NewsController],
  providers: [GetNewsHandler, GetNewsByDateHandler],
})
export class NewsModule {}
