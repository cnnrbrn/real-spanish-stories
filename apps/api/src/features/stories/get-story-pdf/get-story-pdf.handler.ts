import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoryPdfQuery } from "./get-story-pdf.query";
import { storiesSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { StorageService } from "src/storage/storage.service";

@QueryHandler(GetStoryPdfQuery)
export class GetStoryPdfHandler implements IQueryHandler<GetStoryPdfQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    query: GetStoryPdfQuery,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, query.id),
      columns: {
        pdfLightPath: true,
        pdfDarkPath: true,
        altTitle: true,
        level: true,
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${query.id} not found`);
    }

    const pdfPath =
      query.theme === "light" ? story.pdfLightPath : story.pdfDarkPath;
    if (!pdfPath) {
      throw new NotFoundException(
        `Story ${query.id} has no ${query.theme} PDF`,
      );
    }

    const buffer = await this.storageService.download(pdfPath as string);
    const filename = pdfPath.split("/")[1];
    return { buffer, filename };
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
