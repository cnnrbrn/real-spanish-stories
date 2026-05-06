import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { desc, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { GetVideosQuery } from "./get-videos.query";
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

  async execute() {
    return this.database
      .select({
        id: videosSchema.id,
        title: videosSchema.title,
        altTitle: videosSchema.altTitle,
        status: videosSchema.status,
        level: videosSchema.level,
        useSpanishHeadings: videosSchema.useSpanishHeadings,
        skipEnglishTitle: videosSchema.skipEnglishTitle,
        audioPath: videosSchema.audioPath,
        audioFilename: videosSchema.audioFilename,
        videoPath: videosSchema.videoPath,
        errorMessage: videosSchema.errorMessage,
        createdAt: videosSchema.createdAt,
        updatedAt: videosSchema.updatedAt,
        hasTranscriptionJson: sql<boolean>`(${videosSchema.transcriptionJson} IS NOT NULL)`.mapWith(Boolean),
        hasSectionsJson: sql<boolean>`(${videosSchema.sectionsJson} IS NOT NULL)`.mapWith(Boolean),
        hasLanguageTaggedJson: sql<boolean>`(${videosSchema.languageTaggedJson} IS NOT NULL)`.mapWith(Boolean),
        hasTranscriptionMarkdown: sql<boolean>`(${videosSchema.transcriptionMarkdown} IS NOT NULL)`.mapWith(Boolean),
      })
      .from(videosSchema)
      .orderBy(desc(videosSchema.createdAt));
  }
}
