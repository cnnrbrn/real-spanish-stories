import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoriesGroupedQuery } from "./get-stories-grouped.query";
import {
  storiesSchema,
  storyGroupSchema,
  type StoryGroup,
} from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

@QueryHandler(GetStoriesGroupedQuery)
export class GetStoriesGroupedHandler
  implements IQueryHandler<GetStoriesGroupedQuery>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute(): Promise<StoryGroup[]> {
    const rows = await this.database
      .select({
        altTitle: storiesSchema.altTitle,
        levels: sql<Array<{ level: string; slug: string; videoLink: string | null }>>`
          json_agg(
            json_build_object('level', ${storiesSchema.level}, 'slug', ${storiesSchema.slug}, 'videoLink', ${storiesSchema.videoLink})
            ORDER BY array_position(
              ARRAY['absolute-beginner', 'beginner', 'intermediate', 'advanced']::varchar[],
              ${storiesSchema.level}
            )
          )
        `,
      })
      .from(storiesSchema)
      .where(eq(storiesSchema.status, "published"))
      .groupBy(storiesSchema.altTitle)
      .orderBy(sql`MAX(${storiesSchema.createdAt}) DESC`);

    return z.array(storyGroupSchema).parse(rows);
  }
}
