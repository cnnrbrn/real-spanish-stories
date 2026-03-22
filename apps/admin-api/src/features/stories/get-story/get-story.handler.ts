import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { storiesSchema, type Story } from "@real-spanish-stories/shared";
import { GetStoryQuery } from "./get-story.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetStoryQuery)
export class GetStoryHandler implements IQueryHandler<GetStoryQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute(query: GetStoryQuery): Promise<Story> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, query.id),
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${query.id} not found`);
    }

    return story;
  }
}
