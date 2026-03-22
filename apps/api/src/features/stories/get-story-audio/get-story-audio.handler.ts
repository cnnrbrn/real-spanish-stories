import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoryAudioQuery } from "./get-story-audio.query";
import { storiesSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { StorageService } from "src/storage/storage.service";

@QueryHandler(GetStoryAudioQuery)
export class GetStoryAudioHandler implements IQueryHandler<GetStoryAudioQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(query: GetStoryAudioQuery): Promise<{ buffer: Buffer; filename: string }> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, query.id),
      columns: { audioPath: true, audioFilename: true },
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${query.id} not found`);
    }

    if (!story.audioPath || !story.audioFilename) {
      throw new NotFoundException(`Story ${query.id} has no audio file`);
    }

    const buffer = await this.storageService.download(story.audioPath);
    return { buffer, filename: story.audioFilename };
  }
}
