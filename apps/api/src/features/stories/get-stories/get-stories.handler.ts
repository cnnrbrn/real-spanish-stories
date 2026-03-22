import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoriesQuery } from "./get-stories.query";
import { storiesSchema, type StoryResponse } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

@QueryHandler(GetStoriesQuery)
export class GetStoriesHandler implements IQueryHandler<GetStoriesQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}
  async execute(query: GetStoriesQuery): Promise<StoryResponse[]> {
    const stories = await this.database
      .select({
        id: storiesSchema.id,
        title: storiesSchema.title,
        altTitle: storiesSchema.altTitle,
        videoLink: storiesSchema.videoLink,
        level: storiesSchema.level,
        isPremium: storiesSchema.isPremium,
        createdAt: storiesSchema.createdAt,
      })
      .from(storiesSchema);
    return stories as StoryResponse[];
  }
}
