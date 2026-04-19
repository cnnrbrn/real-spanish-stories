import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoriesQuery } from "./get-stories.query";
import {
  storySchema,
  storiesSchema,
  type StoryResponse,
} from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

@QueryHandler(GetStoriesQuery)
export class GetStoriesHandler implements IQueryHandler<GetStoriesQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}
  async execute(query: GetStoriesQuery): Promise<StoryResponse[]> {
    const whereClause =
      query.levels && query.levels.length > 0
        ? and(
            eq(storiesSchema.status, "published"),
            inArray(storiesSchema.level, query.levels),
          )
        : eq(storiesSchema.status, "published");

    const stories = await this.database
      .select({
        id: storiesSchema.id,
        title: storiesSchema.title,
        altTitle: storiesSchema.altTitle,
        description: storiesSchema.description,
        slug: storiesSchema.slug,
        videoLink: storiesSchema.videoLink,
        level: storiesSchema.level,
        status: storiesSchema.status,
        isPremium: storiesSchema.isPremium,
        createdAt: storiesSchema.createdAt,
        updatedAt: storiesSchema.updatedAt,
      })
      .from(storiesSchema)
      .where(whereClause)
      .orderBy(desc(storiesSchema.createdAt));
    return z.array(storySchema).parse(stories);
  }
}
