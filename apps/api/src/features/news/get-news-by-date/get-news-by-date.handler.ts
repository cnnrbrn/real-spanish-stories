import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  newsDetailSchema,
  newsSchema,
  type NewsDetail,
} from "@real-spanish-stories/shared";
import { GetNewsByDateQuery } from "./get-news-by-date.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetNewsByDateQuery)
export class GetNewsByDateHandler
  implements IQueryHandler<GetNewsByDateQuery>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(query: GetNewsByDateQuery): Promise<NewsDetail> {
    const item = await this.database.query.news.findFirst({
      where: and(
        eq(newsSchema.date, query.date),
        eq(newsSchema.status, "published"),
      ),
    });

    if (!item) {
      throw new NotFoundException(`News item not found for ${query.date}`);
    }

    return newsDetailSchema.parse(item);
  }
}
