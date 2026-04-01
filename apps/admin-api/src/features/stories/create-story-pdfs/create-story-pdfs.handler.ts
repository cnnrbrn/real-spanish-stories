import { Inject, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { CreateStoryPdfsCommand } from "./create-story-pdfs.command";
import { generateStoryPdf } from "./pdf-generator";
import { storiesSchema, STORY_LEVELS } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { StorageService } from "src/storage/storage.service";

function toFileSlug(text: string): string {
  return text
    .replace(/[áàäâ]/gi, "a")
    .replace(/[éèëê]/gi, "e")
    .replace(/[íìïî]/gi, "i")
    .replace(/[óòöô]/gi, "o")
    .replace(/[úùüû]/gi, "u")
    .replace(/ñ/gi, "n")
    .replace(/ç/gi, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
}

const THEME_LABEL = { light: "Light", dark: "Dark" } as const;

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

    const levelEntry = STORY_LEVELS.find((l) => l.value === story.level);
    const titleSlug = toFileSlug(story.title);
    const levelLabel = levelEntry
      ? toFileSlug(levelEntry.label)
      : toFileSlug(story.level ?? "Unknown");

    const buildKey = (theme: "light" | "dark") =>
      `pdf/${titleSlug}-${levelLabel}-Spanish-${THEME_LABEL[theme]}-${story.id}.pdf`;

    const lightKey = buildKey("light");
    const darkKey = buildKey("dark");

    let lightBuffer: Buffer, darkBuffer: Buffer;
    try {
      [lightBuffer, darkBuffer] = await Promise.all([
        generateStoryPdf(story, "light"),
        generateStoryPdf(story, "dark"),
      ]);
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to generate PDFs for story ${command.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      await this.storageService.upload(lightKey, lightBuffer, "application/pdf");
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to upload light PDF for story ${command.id}: ${err instanceof Error ? err.message : err}`,
      );
    }
    try {
      await this.storageService.upload(darkKey, darkBuffer, "application/pdf");
    } catch (err) {
      await this.storageService.delete(lightKey).catch(() => {});
      throw new InternalServerErrorException(
        `Failed to upload dark PDF for story ${command.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

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
