import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { GetVideosQuery } from "./get-videos.query";
import type { Video } from "@real-spanish-stories/shared";
import { videosSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetVideosQuery)
export class GetVideosHandler implements IQueryHandler<GetVideosQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(): Promise<Video[]> {
    return this.database
      .select()
      .from(videosSchema)
      .orderBy(desc(videosSchema.createdAt));
  }
}
