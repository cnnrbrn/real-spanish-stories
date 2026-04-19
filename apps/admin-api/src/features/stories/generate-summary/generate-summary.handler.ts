import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { storiesSchema } from "@real-spanish-stories/shared";
import { GenerateSummaryCommand } from "./generate-summary.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(GenerateSummaryCommand)
export class GenerateSummaryHandler implements ICommandHandler<GenerateSummaryCommand> {
  private readonly openai: OpenAI;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      stories: typeof storiesSchema;
    }>,
    configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: configService.getOrThrow("OPENAI_API_KEY"),
    });
  }

  async execute(command: GenerateSummaryCommand): Promise<{ summary: string }> {
    const story = await this.database.query.stories.findFirst({
      where: eq(storiesSchema.id, command.storyId),
    });

    if (!story) {
      throw new NotFoundException(`Story with id ${command.storyId} not found`);
    }

    const transcriptionText = story.transcription
      ? JSON.stringify(story.transcription)
      : story.title;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a summary for a Spanish learning story page. The summary should be 1 - 2 paragraphs in British English. It should tell the learner what the story is about, what level it is aimed at, and what vocabulary or grammar themes they can expect to practise. Write in an encouraging, informative tone - no exclamation marks. It must also be good for SEO.

Story title (English): "${story.altTitle}"
Level: ${story.level ?? "general"}
Transcription context: ${transcriptionText}

Return only the summary text, nothing else.`,
        },
      ],
      max_tokens: 200,
    });

    const summary = response.choices[0]?.message?.content?.trim() ?? "";

    return { summary };
  }
}
