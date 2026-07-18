import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { DatabaseModule } from "src/database/database.module";
import { StorageModule } from "src/storage/storage.module";
import { DeepgramTranscriptionService } from "./deepgram-transcription.service";
import { GladiaTranscriptionService } from "./gladia-transcription.service";
import { ReplicateTranscriptionService } from "./replicate-transcription.service";
import { TranscriptionProcessor } from "./transcription.processor";

@Module({
  imports: [
    BullModule.registerQueue({ name: "transcription" }),
    BullModule.registerQueue({ name: "transcription-local" }),
    DatabaseModule,
    StorageModule,
  ],
  providers: [
    DeepgramTranscriptionService,
    GladiaTranscriptionService,
    ReplicateTranscriptionService,
    TranscriptionProcessor,
  ],
  exports: [BullModule],
})
export class TranscriptionModule {}
