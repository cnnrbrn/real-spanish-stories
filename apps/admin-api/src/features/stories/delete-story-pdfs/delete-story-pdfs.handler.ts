import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { DeleteStoryPdfsCommand } from "./delete-story-pdfs.command";
import { storiesSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

@CommandHandler(DeleteStoryPdfsCommand)
export class DeleteStoryPdfsHandler
  implements ICommandHandler<DeleteStoryPdfsCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: DeleteStoryPdfsCommand): Promise<void> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, command.id),
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${command.id} not found`);
    }

    if (!story.pdfLightPath && !story.pdfDarkPath) {
      throw new NotFoundException(
        `Story with id ${command.id} has no PDFs`,
      );
    }

    const deletions: Promise<void>[] = [];
    if (story.pdfLightPath) {
      deletions.push(this.storageService.delete(story.pdfLightPath));
    }
    if (story.pdfDarkPath) {
      deletions.push(this.storageService.delete(story.pdfDarkPath));
    }
    await Promise.all(deletions);

    await this.database
      .update(storiesSchema)
      .set({
        pdfLightPath: null,
        pdfDarkPath: null,
        updatedAt: new Date(),
      })
      .where(eq(storiesSchema.id, command.id));
  }
}
