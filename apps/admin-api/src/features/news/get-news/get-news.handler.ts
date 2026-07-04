import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { newsSchema, type News } from "@real-spanish-stories/shared";
import { GetNewsQuery } from "./get-news.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetNewsQuery)
export class GetNewsHandler implements IQueryHandler<GetNewsQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(query: GetNewsQuery): Promise<News> {
    const item = await this.database.query.news.findFirst({
      where: eq(newsSchema.id, query.id),
    });

    if (!item) {
      throw new NotFoundException(`News item with id ${query.id} not found`);
    }

    return item;
  }
}
