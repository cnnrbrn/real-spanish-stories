import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { storiesSchema } from "@real-spanish-stories/shared";
import { GenerateDescriptionCommand } from "./generate-description.command";
import { DATABASE_CONNECTION } from "src/database/database.constants";

@CommandHandler(GenerateDescriptionCommand)
export class GenerateDescriptionHandler implements ICommandHandler<GenerateDescriptionCommand> {
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

  async execute(
    command: GenerateDescriptionCommand,
  ): Promise<{ description: string }> {
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
          content: `Write an SEO meta description for a Spanish learning story. Here is an example of a good description:

"Improve your Spanish with this beginner level story about the Paraguayan War. We summarise the story in English then explore the vocabulary and verbs before listening to the story. A free PDF of the script is available for download."

Now write one for: "${story.altTitle}" (level: ${story.level ?? "general"}). Transcription context: ${transcriptionText}.

Match the tone and structure of the example exactly. CRITICAL: the description must be 160 characters or fewer in total length — count every character including spaces. Use the English title not the Spanish title, no exclamation marks, use British English spelling (e.g. "summarise" not "summarize"). Return only the description text, nothing else.`,
        },
      ],
      max_tokens: 60,
    });

    const description = response.choices[0]?.message?.content?.trim() ?? "";

    return { description: description.slice(0, 160) };
  }
}
