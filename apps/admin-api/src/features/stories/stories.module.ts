import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { StoriesController } from "./stories.controller";
import { GetStoriesHandler } from "./get-stories/get-stories.handler";
import { GetStoryHandler } from "./get-story/get-story.handler";
import { GetStoryByVideoHandler } from "./get-story-by-video/get-story-by-video.handler";
import { CreateStoryFromVideoHandler } from "./create-story-from-video/create-story-from-video.handler";
import { UpdateStoryHandler } from "./update-story/update-story.handler";
import { UpdateStoryStatusHandler } from "./update-story-status/update-story-status.handler";
import { DeleteStoryHandler } from "./delete-story/delete-story.handler";
import { StorageModule } from "src/storage/storage.module";
import { UploadAudioToStoryHandler } from "./upload-audio-to-story/upload-audio-to-story.handler";
import { CreateStoryPdfsHandler } from "./create-story-pdfs/create-story-pdfs.handler";
import { DeleteStoryPdfsHandler } from "./delete-story-pdfs/delete-story-pdfs.handler";
import { GenerateDescriptionHandler } from "./generate-description/generate-description.handler";

@Module({
  imports: [DatabaseModule, CqrsModule, StorageModule],
  controllers: [StoriesController],
  providers: [
    GetStoriesHandler,
    GetStoryHandler,
    GetStoryByVideoHandler,
    CreateStoryFromVideoHandler,
    UpdateStoryHandler,
    UpdateStoryStatusHandler,
    DeleteStoryHandler,
    UploadAudioToStoryHandler,
    CreateStoryPdfsHandler,
    DeleteStoryPdfsHandler,
    GenerateDescriptionHandler,
  ],
})
export class StoriesModule {}
