import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { ImportSubtitleCommand } from "./import-subtitle.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { fromAss } from "../subtitle.utils";

@CommandHandler(ImportSubtitleCommand)
export class ImportSubtitleHandler
  implements ICommandHandler<ImportSubtitleCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: ImportSubtitleCommand): Promise<Video> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.videoId} not found`,
      );
    }

    if (!video.transcriptionJson) {
      throw new BadRequestException(
        "Video has no transcription data to update.",
      );
    }

    const updatedJson = fromAss(command.assContent, video.transcriptionJson);

    const [updated] = await this.database
      .update(videosSchema)
      .set({
        transcriptionJson: updatedJson,
        sectionsJson: null,
        languageTaggedJson: null,
        status: "transcribed",
        updatedAt: new Date(),
      })
      .where(eq(videosSchema.id, command.videoId))
      .returning();

    return updated;
  }
}
