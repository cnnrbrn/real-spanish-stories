import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { DeleteVideoCommand } from "./delete-video.command";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

@CommandHandler(DeleteVideoCommand)
export class DeleteVideoHandler
  implements ICommandHandler<DeleteVideoCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: DeleteVideoCommand): Promise<void> {
    const [video] = await this.database
      .delete(videosSchema)
      .where(eq(videosSchema.id, command.id))
      .returning({
        audioPath: videosSchema.audioPath,
        videoPath: videosSchema.videoPath,
      });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.id} not found`,
      );
    }

    const keys = [video.audioPath, video.videoPath].filter(Boolean);
    await Promise.all(
      keys.map((key) => this.storageService.delete(key!).catch(() => {})),
    );
  }
}
