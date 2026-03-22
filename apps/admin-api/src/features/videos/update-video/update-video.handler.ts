import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { UpdateVideoCommand } from "./update-video.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { syncTranscriptWords, syncLineBreaks } from "../sync.utils";

@CommandHandler(UpdateVideoCommand)
export class UpdateVideoHandler
  implements ICommandHandler<UpdateVideoCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: UpdateVideoCommand): Promise<Video> {
    const existing = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.id),
    });

    if (!existing) {
      throw new NotFoundException(
        `Video with id ${command.id} not found`,
      );
    }

    const updateData: Record<string, unknown> = {
      ...command.data,
      updatedAt: new Date(),
    };

    // If transcription changed, sync word text to sectionsJson and languageTaggedJson
    if (command.data.transcriptionJson) {
      if (existing.sectionsJson) {
        updateData.sectionsJson = syncTranscriptWords(
          command.data.transcriptionJson,
          existing.sectionsJson,
        );
      }
      if (existing.languageTaggedJson) {
        updateData.languageTaggedJson = syncTranscriptWords(
          command.data.transcriptionJson,
          existing.languageTaggedJson,
        );
      }
    }

    // If sections changed, sync lineBreaks to languageTaggedJson
    if (command.data.sectionsJson && existing.languageTaggedJson) {
      const targetJson =
        (updateData.languageTaggedJson as string) ??
        existing.languageTaggedJson;
      updateData.languageTaggedJson = syncLineBreaks(
        command.data.sectionsJson,
        targetJson,
      );
    }

    const [video] = await this.database
      .update(videosSchema)
      .set(updateData)
      .where(eq(videosSchema.id, command.id))
      .returning();

    return video;
  }
}
