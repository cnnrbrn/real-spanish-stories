import { Controller, Get, Param } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { OptionalAuth } from "@thallesp/nestjs-better-auth";
import { GetNewsQuery } from "./get-news/get-news.query";
import { GetNewsByDateQuery } from "./get-news-by-date/get-news-by-date.query";

@Controller("news")
export class NewsController {
  constructor(private readonly queryBus: QueryBus) {}

  @OptionalAuth()
  @Get()
  getNews() {
    return this.queryBus.execute(new GetNewsQuery());
  }

  @OptionalAuth()
  @Get(":date")
  getNewsByDate(@Param("date") date: string) {
    return this.queryBus.execute(new GetNewsByDateQuery(date));
  }
}
