import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { storyDownloadsSchema } from "@real-spanish-stories/shared";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { DOWNLOAD_LIMITS_PER_DAY, type DownloadKind } from "./constants";

@Injectable()
export class DownloadRateLimitService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      storyDownloads: typeof storyDownloadsSchema;
    }>,
  ) {}

  async checkAndRecord(
    userId: string,
    storyId: number,
    kind: DownloadKind,
  ): Promise<void> {
    const limit = DOWNLOAD_LIMITS_PER_DAY[kind];

    const [{ value }] = await this.database
      .select({ value: count() })
      .from(storyDownloadsSchema)
      .where(
        and(
          eq(storyDownloadsSchema.userId, userId),
          eq(storyDownloadsSchema.storyId, storyId),
          eq(storyDownloadsSchema.kind, kind),
          gt(storyDownloadsSchema.createdAt, sql`now() - interval '24 hours'`),
        ),
      );

    if (value >= limit) {
      throw new HttpException(
        {
          message: `Daily download limit reached. You may download up to ${limit} ${kind} files per story per day.`,
          limit,
          kind,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.database.insert(storyDownloadsSchema).values({
      userId,
      storyId,
      kind,
    });
  }
}
