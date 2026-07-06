import { Controller, Get, Param, ParseIntPipe, Res } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { OptionalAuth, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Response } from "express";
import { GetNewsQuery } from "./get-news/get-news.query";
import { GetNewsByDateQuery } from "./get-news-by-date/get-news-by-date.query";
import { GetNewsPdfQuery } from "./get-news-pdf/get-news-pdf.query";

@Controller("news")
export class NewsController {
  constructor(private readonly queryBus: QueryBus) {}

  @OptionalAuth()
  @Get()
  getNews() {
    return this.queryBus.execute(new GetNewsQuery());
  }

  // Protected (no @OptionalAuth): the global better-auth guard requires a
  // logged-in user. Two-segment path, so it does not collide with @Get(":date").
  @Get(":id/pdf")
  async getNewsPdf(
    @Param("id", ParseIntPipe) id: number,
    @Session() session: UserSession,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.queryBus.execute(
      new GetNewsPdfQuery(session.user.id, id),
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  }

  @OptionalAuth()
  @Get(":date")
  getNewsByDate(@Param("date") date: string) {
    return this.queryBus.execute(new GetNewsByDateQuery(date));
  }
}
