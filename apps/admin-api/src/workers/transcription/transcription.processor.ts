import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { videosSchema } from "@real-spanish-stories/shared";
import { StorageService } from "src/storage/storage.service";
import { DeepgramTranscriptionService } from "./deepgram-transcription.service";
import { ReplicateTranscriptionService } from "./replicate-transcription.service";

export interface TranscriptionJobData {
  videoId: number;
  audioPath: string;
  transcriptionOption: string;
  useSpanishHeadings: boolean;
  fixTimestamps: boolean;
}

export interface AlignmentJobData {
  videoId: number;
  audioPath: string;
  transcriptionText: string;
  language: string;
}

@Processor("transcription")
export class TranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
    private readonly storageService: StorageService,
    private readonly replicateService: ReplicateTranscriptionService,
    private readonly deepgramService: DeepgramTranscriptionService,
    @InjectQueue("transcription-local")
    private readonly alignmentQueue: Queue<AlignmentJobData>,
  ) {
    super();
  }

  async process(job: Job<TranscriptionJobData>): Promise<void> {
    const { videoId, audioPath, transcriptionOption, fixTimestamps } = job.data;
    this.logger.log(
      `Processing transcription job for video ${videoId} (${transcriptionOption})`,
    );

    try {
      const audioBuffer = await this.storageService.download(audioPath);
      const result =
        transcriptionOption === "deepgram"
          ? await this.deepgramService.transcribe(audioBuffer)
          : await this.replicateService.transcribe(audioBuffer);

      if (fixTimestamps && transcriptionOption === "deepgram") {
        await this.database
          .update(videosSchema)
          .set({
            transcriptionJson: JSON.stringify(result),
            status: "aligning",
            errorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(videosSchema.id, videoId));

        await this.alignmentQueue.add("align", {
          videoId,
          audioPath,
          transcriptionText: result.text,
          language: "es",
        });

        this.logger.log(
          `Deepgram transcription saved for video ${videoId} (${result.words.length} words), alignment job queued`,
        );
        return;
      }

      await this.database
        .update(videosSchema)
        .set({
          transcriptionJson: JSON.stringify(result),
          status: "transcribed",
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, videoId));

      this.logger.log(
        `Transcription complete for video ${videoId}: ${result.words.length} words`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Transcription failed for video ${videoId}: ${message}`,
      );

      await this.database
        .update(videosSchema)
        .set({
          status: "failed",
          errorMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, videoId));

      throw error;
    }
  }
}
