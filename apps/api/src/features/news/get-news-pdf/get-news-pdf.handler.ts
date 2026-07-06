import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { newsSchema } from "@real-spanish-stories/shared";
import { GetNewsPdfQuery } from "./get-news-pdf.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";
import { NewsDownloadRateLimitService } from "../news-download-rate-limit.service";

@QueryHandler(GetNewsPdfQuery)
export class GetNewsPdfHandler implements IQueryHandler<GetNewsPdfQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
    private readonly storageService: StorageService,
    private readonly newsDownloadRateLimitService: NewsDownloadRateLimitService,
  ) {}

  async execute(
    query: GetNewsPdfQuery,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const news = await this.database.query.news.findFirst({
      where: eq(newsSchema.id, query.id),
      columns: { pdfPath: true },
    });

    if (!news) {
      throw new NotFoundException(`News item with id ${query.id} not found`);
    }
    if (!news.pdfPath) {
      throw new NotFoundException(`News item ${query.id} has no PDF`);
    }

    await this.newsDownloadRateLimitService.checkAndRecord(
      query.userId,
      query.id,
      "pdf",
    );

    const buffer = await this.storageService.download(news.pdfPath);
    // News keys are `pdf/news/<file>.pdf`, so take the final path segment.
    const filename = news.pdfPath.split("/").pop() ?? "news.pdf";
    return { buffer, filename };
  }
}
