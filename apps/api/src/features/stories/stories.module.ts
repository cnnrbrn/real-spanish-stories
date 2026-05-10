import { Module } from "@nestjs/common";
import { StoriesController } from "./stories.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { StorageModule } from "src/storage/storage.module";
import { GetStoriesHandler } from "./get-stories/get-stories.handler";
import { GetStoriesGroupedHandler } from "./get-stories-grouped/get-stories-grouped.handler";
import { GetStoryHandler } from "./get-story/get-story.handler";
import { GetStoryPdfHandler } from "./get-story-pdf/get-story-pdf.handler";
import { RequestAudioDownloadHandler } from "./request-audio-download/request-audio-download.handler";
import { RequestAudioPlayHandler } from "./request-audio-play/request-audio-play.handler";
import { DownloadRateLimitService } from "./download-rate-limit.service";

@Module({
  imports: [DatabaseModule, CqrsModule, StorageModule],
  controllers: [StoriesController],
  providers: [GetStoriesHandler, GetStoriesGroupedHandler, GetStoryHandler, GetStoryPdfHandler, RequestAudioDownloadHandler, RequestAudioPlayHandler, DownloadRateLimitService],
})
export class StoriesModule {}
