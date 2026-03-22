import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { UploadAudioToStoryCommand } from "./upload-audio-to-story.command";
import { storiesSchema, type Story } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

const ALLOWED_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave"];
const MAX_FILE_SIZE = 30 * 1024 * 1024;

@CommandHandler(UploadAudioToStoryCommand)
export class UploadAudioToStoryHandler
  implements ICommandHandler<UploadAudioToStoryCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: UploadAudioToStoryCommand): Promise<Story> {
    if (!ALLOWED_MIME_TYPES.includes(command.file.mimetype)) {
      throw new BadRequestException("Only WAV and MP3 files are supported");
    }

    if (command.file.size > MAX_FILE_SIZE) {
      throw new BadRequestException("File size must be less than 30MB");
    }

    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, command.storyId),
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${command.storyId} not found`);
    }

    const key = `audio/story_${command.storyId}_${command.file.originalname}`;

    try {
      if (story.audioPath) {
        await this.storageService.delete(story.audioPath);
      }

      await this.storageService.upload(key, command.file.buffer, command.file.mimetype);

      const [updated] = await this.database
        .update(storiesSchema)
        .set({
          audioPath: key,
          audioFilename: command.file.originalname,
          updatedAt: new Date(),
        })
        .where(eq(storiesSchema.id, command.storyId))
        .returning();

      return updated;
    } catch (error) {
      await this.storageService.delete(key).catch(() => {});
      throw error;
    }
  }
}
