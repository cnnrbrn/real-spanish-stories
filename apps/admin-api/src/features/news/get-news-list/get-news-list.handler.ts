import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { newsSchema } from "@real-spanish-stories/shared";
import { GetNewsListQuery } from "./get-news-list.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetNewsListQuery)
export class GetNewsListHandler implements IQueryHandler<GetNewsListQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute() {
    return this.database
      .select()
      .from(newsSchema)
      .orderBy(desc(newsSchema.date));
  }
}
