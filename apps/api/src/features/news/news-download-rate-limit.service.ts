import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { newsDownloadsSchema } from "@real-spanish-stories/shared";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NEWS_DOWNLOAD_LIMITS_PER_DAY, type NewsDownloadKind } from "./constants";

@Injectable()
export class NewsDownloadRateLimitService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      newsDownloads: typeof newsDownloadsSchema;
    }>,
  ) {}

  async checkAndRecord(
    userId: string,
    newsId: number,
    kind: NewsDownloadKind,
  ): Promise<void> {
    const limit = NEWS_DOWNLOAD_LIMITS_PER_DAY[kind];

    const [{ value }] = await this.database
      .select({ value: count() })
      .from(newsDownloadsSchema)
      .where(
        and(
          eq(newsDownloadsSchema.userId, userId),
          eq(newsDownloadsSchema.newsId, newsId),
          eq(newsDownloadsSchema.kind, kind),
          gt(newsDownloadsSchema.createdAt, sql`now() - interval '24 hours'`),
        ),
      );

    if (value >= limit) {
      throw new HttpException(
        {
          message: `Daily download limit reached. You may download up to ${limit} ${kind} files per article per day.`,
          limit,
          kind,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.database.insert(newsDownloadsSchema).values({
      userId,
      newsId,
      kind,
    });
  }
}
