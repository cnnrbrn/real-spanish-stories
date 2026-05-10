import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { storiesSchema } from "@real-spanish-stories/shared";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";
import { PRESIGNED_AUDIO_URL_TTL_SECONDS } from "../constants";
import { RequestAudioPlayCommand } from "./request-audio-play.command";

@CommandHandler(RequestAudioPlayCommand)
export class RequestAudioPlayHandler
  implements ICommandHandler<RequestAudioPlayCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: RequestAudioPlayCommand): Promise<string> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, command.storyId),
      columns: { audioPath: true },
    });

    if (!story?.audioPath) {
      throw new NotFoundException(
        `Story ${command.storyId} has no audio file`,
      );
    }

    return this.storageService.getPresignedUrl(
      story.audioPath,
      PRESIGNED_AUDIO_URL_TTL_SECONDS,
    );
  }
}
