import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { desc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  newsResponseSchema,
  newsSchema,
  type NewsResponse,
} from "@real-spanish-stories/shared";
import { GetNewsQuery } from "./get-news.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { z } from "zod";

@QueryHandler(GetNewsQuery)
export class GetNewsHandler implements IQueryHandler<GetNewsQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
  ) {}

  async execute(): Promise<NewsResponse[]> {
    const rows = await this.database
      .select({
        id: newsSchema.id,
        date: newsSchema.date,
        title: newsSchema.title,
        listSummary: newsSchema.listSummary,
        videoLink: newsSchema.videoLink,
        pdfPath: newsSchema.pdfPath,
        status: newsSchema.status,
        createdAt: newsSchema.createdAt,
        updatedAt: newsSchema.updatedAt,
      })
      .from(newsSchema)
      .where(eq(newsSchema.status, "published"))
      .orderBy(desc(newsSchema.date));

    return z.array(newsResponseSchema).parse(rows);
  }
}
