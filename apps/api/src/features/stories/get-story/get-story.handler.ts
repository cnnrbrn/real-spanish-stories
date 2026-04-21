import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoryQuery } from "./get-story.query";
import {
  storyDetailSchema,
  storySchema,
  storiesSchema,
  STORY_LEVELS,
  type StoryDetail,
} from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

@QueryHandler(GetStoryQuery)
export class GetStoryHandler implements IQueryHandler<GetStoryQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}
  async execute(query: GetStoryQuery): Promise<StoryDetail> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.slug, query.slug),
    });

    if (!story) {
      throw new NotFoundException(`Story not found`);
    }

    const levelOrder: string[] = STORY_LEVELS.map((l) => l.value);

    const siblingRows = await this.database
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
      .where(
        and(
          eq(storiesSchema.altTitle, story.altTitle),
          eq(storiesSchema.status, "published"),
        ),
      );

    const siblings = z
      .array(storySchema)
      .parse(siblingRows)
      .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));

    return storyDetailSchema.parse({ ...story, siblings });
  }
}
