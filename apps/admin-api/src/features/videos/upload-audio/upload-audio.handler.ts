import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectQueue } from "@nestjs/bullmq";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Queue } from "bullmq";
import { UploadAudioCommand } from "./upload-audio.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";
import type { TranscriptionJobData } from "src/workers/transcription/transcription.processor";

const ALLOWED_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave"];

@CommandHandler(UploadAudioCommand)
export class UploadAudioHandler
  implements ICommandHandler<UploadAudioCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
    private readonly storageService: StorageService,
    @InjectQueue("transcription")
    private readonly transcriptionQueue: Queue<TranscriptionJobData>,
    @InjectQueue("transcription-local")
    private readonly transcriptionLocalQueue: Queue<TranscriptionJobData>,
  ) {}

  async execute(command: UploadAudioCommand): Promise<Video> {
    if (!ALLOWED_MIME_TYPES.includes(command.file.mimetype)) {
      throw new BadRequestException("Only WAV and MP3 files are supported");
    }

    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.videoId} not found`,
      );
    }

    const key = `audio/video_${command.videoId}_${command.file.originalname}`;
    await this.storageService.upload(key, command.file.buffer, command.file.mimetype);

    try {
      const [updated] = await this.database
        .update(videosSchema)
        .set({
          audioPath: key,
          audioFilename: command.file.originalname,
          useSpanishHeadings: command.useSpanishHeadings,
          status: "transcribing",
          errorMessage: null,
          transcriptionJson: null,
          sectionsJson: null,
          languageTaggedJson: null,
          transcriptionMarkdown: null,
          videoPath: null,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      if (command.transcriptionOption === "local-whisperx") {
        await this.transcriptionLocalQueue.add("transcribe", {
          videoId: command.videoId,
          audioPath: key,
          transcriptionOption: command.transcriptionOption,
          useSpanishHeadings: command.useSpanishHeadings,
          fixTimestamps: command.fixTimestamps,
        });
      } else {
        await this.transcriptionQueue.add("transcribe", {
          videoId: command.videoId,
          audioPath: key,
          transcriptionOption: command.transcriptionOption,
          useSpanishHeadings: command.useSpanishHeadings,
          fixTimestamps: command.fixTimestamps,
        });
      }

      return updated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      await this.database
        .update(videosSchema)
        .set({
          status: "failed",
          errorMessage: `Audio upload failed: ${message}`,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId));

      await this.storageService.delete(key).catch(() => {});
      throw error;
    }
  }
}
