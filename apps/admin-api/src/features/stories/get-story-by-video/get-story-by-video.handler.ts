import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { storiesSchema, type Story } from "@real-spanish-stories/shared";
import { GetStoryByVideoQuery } from "./get-story-by-video.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetStoryByVideoQuery)
export class GetStoryByVideoHandler implements IQueryHandler<GetStoryByVideoQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute(query: GetStoryByVideoQuery): Promise<Story> {
    const [story] = await this.database
      .select()
      .from(storiesSchema)
      .where(eq(storiesSchema.videoId, query.videoId))
      .limit(1);

    if (!story) {
      throw new NotFoundException(`Story for video ${query.videoId} not found`);
    }

    return story;
  }
}
