import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { DeleteNewsPdfCommand } from "./delete-news-pdf.command";
import { newsSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

@CommandHandler(DeleteNewsPdfCommand)
export class DeleteNewsPdfHandler
  implements ICommandHandler<DeleteNewsPdfCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: DeleteNewsPdfCommand): Promise<void> {
    const news = await this.database.query.news.findFirst({
      where: eq(newsSchema.id, command.id),
    });

    if (!news) {
      throw new NotFoundException(`News item with id ${command.id} not found`);
    }

    if (!news.pdfPath) {
      throw new NotFoundException(
        `News item with id ${command.id} has no PDF`,
      );
    }

    await this.storageService.delete(news.pdfPath);

    await this.database
      .update(newsSchema)
      .set({ pdfPath: null, updatedAt: new Date() })
      .where(eq(newsSchema.id, command.id));
  }
}
