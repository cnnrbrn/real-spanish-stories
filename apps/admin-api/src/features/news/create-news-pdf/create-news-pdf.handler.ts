import {
  BadRequestException,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { CreateNewsPdfCommand } from "./create-news-pdf.command";
import { generateNewsPdf } from "./news-pdf-generator";
import { newsSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

@CommandHandler(CreateNewsPdfCommand)
export class CreateNewsPdfHandler
  implements ICommandHandler<CreateNewsPdfCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      news: typeof newsSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: CreateNewsPdfCommand): Promise<{ pdfPath: string }> {
    const news = await this.database.query.news.findFirst({
      where: eq(newsSchema.id, command.id),
    });

    if (!news) {
      throw new NotFoundException(`News item with id ${command.id} not found`);
    }

    if (!news.transcript) {
      throw new BadRequestException(
        `News item with id ${command.id} has no transcript`,
      );
    }

    const key = `pdf/news/${news.date}-${news.id}.pdf`;

    let buffer: Buffer;
    try {
      buffer = await generateNewsPdf(news);
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to generate PDF for news ${command.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      await this.storageService.upload(key, buffer, "application/pdf");
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to upload PDF for news ${command.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

    const [updated] = await this.database
      .update(newsSchema)
      .set({ pdfPath: key, updatedAt: new Date() })
      .where(eq(newsSchema.id, command.id))
      .returning();

    return { pdfPath: updated.pdfPath! };
  }
}
