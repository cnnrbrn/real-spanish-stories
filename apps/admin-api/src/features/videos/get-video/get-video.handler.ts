import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { GetVideoQuery } from "./get-video.query";
import type { Video } from "@real-spanish-stories/shared";
import { videosSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IQueryHandler<GetVideoQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(query: GetVideoQuery): Promise<Video> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, query.id),
    });

    if (!video) {
      throw new NotFoundException(`Video with id ${query.id} not found`);
    }

    return video;
  }
}
