import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { storiesSchema } from "@real-spanish-stories/shared";
import { GetStoriesQuery } from "./get-stories.query";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@QueryHandler(GetStoriesQuery)
export class GetStoriesHandler implements IQueryHandler<GetStoriesQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
  ) {}

  async execute() {
    return this.database
      .select({
        id: storiesSchema.id,
        videoId: storiesSchema.videoId,
        title: storiesSchema.title,
        altTitle: storiesSchema.altTitle,
        description: storiesSchema.description,
        summary: storiesSchema.summary,
        level: storiesSchema.level,
        status: storiesSchema.status,
        audioPath: storiesSchema.audioPath,
        audioFilename: storiesSchema.audioFilename,
        pdfLightPath: storiesSchema.pdfLightPath,
        pdfDarkPath: storiesSchema.pdfDarkPath,
        slug: storiesSchema.slug,
        videoLink: storiesSchema.videoLink,
        isPremium: storiesSchema.isPremium,
        createdAt: storiesSchema.createdAt,
        updatedAt: storiesSchema.updatedAt,
      })
      .from(storiesSchema)
      .orderBy(desc(storiesSchema.createdAt));
  }
}
