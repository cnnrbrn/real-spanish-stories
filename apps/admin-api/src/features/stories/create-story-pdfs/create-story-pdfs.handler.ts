import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { CreateStoryPdfsCommand } from "./create-story-pdfs.command";
import { slugify, generateStoryPdf } from "./pdf-generator";
import { storiesSchema, STORY_LEVELS } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

const THEME_ES = { light: "claro", dark: "oscuro" } as const;

@CommandHandler(CreateStoryPdfsCommand)
export class CreateStoryPdfsHandler
  implements ICommandHandler<CreateStoryPdfsCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    command: CreateStoryPdfsCommand,
  ): Promise<{ pdfLightPath: string; pdfDarkPath: string }> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, command.id),
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${command.id} not found`);
    }

    if (!story.transcription) {
      throw new NotFoundException(
        `Story with id ${command.id} has no transcription`,
      );
    }

    const slug = slugify(story.title);
    const levelEntry = STORY_LEVELS.find((l) => l.value === story.level);
    const levelEs = levelEntry
      ? levelEntry.labelEs.toLowerCase()
      : story.level ?? "unknown";

    const buildKey = (theme: "light" | "dark") =>
      `pdf/${slug}-${levelEs}-espanol-${story.id}-${THEME_ES[theme]}.pdf`;

    const lightKey = buildKey("light");
    const darkKey = buildKey("dark");

    const [lightBuffer, darkBuffer] = await Promise.all([
      generateStoryPdf(story, "light"),
      generateStoryPdf(story, "dark"),
    ]);

    await Promise.all([
      this.storageService.upload(lightKey, lightBuffer, "application/pdf"),
      this.storageService.upload(darkKey, darkBuffer, "application/pdf"),
    ]);

    const [updated] = await this.database
      .update(storiesSchema)
      .set({
        pdfLightPath: lightKey,
        pdfDarkPath: darkKey,
        updatedAt: new Date(),
      })
      .where(eq(storiesSchema.id, command.id))
      .returning();

    return {
      pdfLightPath: updated.pdfLightPath!,
      pdfDarkPath: updated.pdfDarkPath!,
    };
  }
}
