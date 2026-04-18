import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoryQuery } from "./get-story.query";
import {
  storyDetailSchema,
  storiesSchema,
  type StoryDetail,
} from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

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

    return storyDetailSchema.parse(story);
  }
}
