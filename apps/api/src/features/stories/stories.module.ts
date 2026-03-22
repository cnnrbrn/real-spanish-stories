import { Module } from "@nestjs/common";
import { StoriesController } from "./stories.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { StorageModule } from "src/storage/storage.module";
import { GetStoriesHandler } from "./get-stories/get-stories.handler";
import { GetStoryHandler } from "./get-story/get-story.handler";
import { GetStoryAudioHandler } from "./get-story-audio/get-story-audio.handler";
import { GetStoryPdfHandler } from "./get-story-pdf/get-story-pdf.handler";

@Module({
  imports: [DatabaseModule, CqrsModule, StorageModule],
  controllers: [StoriesController],
  providers: [GetStoriesHandler, GetStoryHandler, GetStoryAudioHandler, GetStoryPdfHandler],
})
export class StoriesModule {}
