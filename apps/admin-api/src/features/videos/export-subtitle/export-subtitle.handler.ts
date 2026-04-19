import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  ExportSubtitleQuery,
  ExportSubtitleResult,
} from "./export-subtitle.query";
import { videosSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { toAss } from "../subtitle.utils";

@QueryHandler(ExportSubtitleQuery)
export class ExportSubtitleHandler
  implements IQueryHandler<ExportSubtitleQuery>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(query: ExportSubtitleQuery): Promise<ExportSubtitleResult> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, query.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${query.videoId} not found`,
      );
    }

    if (!video.transcriptionJson) {
      throw new BadRequestException(
        "Video does not have transcription data.",
      );
    }

    const content = toAss(video.transcriptionJson, video.title);
    const slug =
      video.title
        .toLowerCase()
        .replace(/[\W_]+/g, "-")
        .replace(/^-|-$/g, "") || "transcription";
    const filename = `${slug}-transcription.ass`;

    return { filename, content };
  }
}
