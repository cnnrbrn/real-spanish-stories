import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { StorageModule } from "src/storage/storage.module";
import { TranscriptionModule } from "src/workers/transcription/transcription.module";
import { VideoGenerationModule } from "src/workers/video-generation/video-generation.module";
import { VideosController } from "./videos.controller";
import { GetVideosHandler } from "./get-videos/get-videos.handler";
import { GetVideoHandler } from "./get-video/get-video.handler";
import { CreateVideoHandler } from "./create-video/create-video.handler";
import { UpdateVideoHandler } from "./update-video/update-video.handler";
import { DeleteVideoHandler } from "./delete-video/delete-video.handler";
import { UploadAudioHandler } from "./upload-audio/upload-audio.handler";
import { ExportSubtitleHandler } from "./export-subtitle/export-subtitle.handler";
import { ImportSubtitleHandler } from "./import-subtitle/import-subtitle.handler";
import { DetectSectionsHandler } from "./detect-sections/detect-sections.handler";
import { TagLanguagesHandler } from "./tag-languages/tag-languages.handler";
import { GenerateVideoHandler } from "./generate-video/generate-video.handler";

@Module({
  imports: [DatabaseModule, CqrsModule, StorageModule, TranscriptionModule, VideoGenerationModule],
  controllers: [VideosController],
  providers: [
    GetVideosHandler,
    GetVideoHandler,
    CreateVideoHandler,
    UpdateVideoHandler,
    DeleteVideoHandler,
    UploadAudioHandler,
    ExportSubtitleHandler,
    ImportSubtitleHandler,
    DetectSectionsHandler,
    TagLanguagesHandler,
    GenerateVideoHandler,
  ],
})
export class VideosModule {}
