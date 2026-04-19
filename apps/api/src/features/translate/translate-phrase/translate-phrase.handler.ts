import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { Inject, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TranslatePhraseCommand } from "./translate-phrase.command";
import { TranslationResponseDto } from "../translate.dto";
import { translationResponseSchema } from "@real-spanish-stories/shared";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { storiesSchema } from "@real-spanish-stories/shared";
import { translationCacheSchema } from "@real-spanish-stories/shared";

@CommandHandler(TranslatePhraseCommand)
export class TranslatePhraseHandler implements ICommandHandler<TranslatePhraseCommand> {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{ stories: typeof storiesSchema }>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow("OPENAI_API_KEY"),
    });
  }

  async execute(command: TranslatePhraseCommand): Promise<TranslationResponseDto> {
    const { phrase: rawPhrase, storyId } = command;
    const phrase = rawPhrase.toLowerCase().trim();

    const [cached] = await this.db
      .select()
      .from(translationCacheSchema)
      .where(and(eq(translationCacheSchema.phrase, phrase), eq(translationCacheSchema.storyId, storyId)))
      .limit(1);

    if (cached) {
      return { translation: cached.translation, explanation: cached.explanation };
    }

    const [story] = await this.db
      .select()
      .from(storiesSchema)
      .where(eq(storiesSchema.id, storyId))
      .limit(1);

    if (!story) {
      throw new NotFoundException(`Story ${storyId} not found`);
    }

    if (!story.transcription) {
      throw new NotFoundException(`Story ${storyId} has no transcription`);
    }

    const storySection = story.transcription.sections.find((s) => s.type === "story");
    const storyText = storySection ? storySection.words.map((w) => w.word).join(" ") : "";

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are a Spanish language tutor. Here is the Spanish story the user is reading:\n"${storyText}"\nThe user selected the word or phrase "${phrase}". In the context of this specific story, provide:\n1. The English translation (one line)\n2. An explanation as an array of paragraph strings. Rules: (a) If the entire selection is a single simple noun or adjective with a self-evident translation, return an empty array. (b) If ANY word in the selection is a conjugated verb, ALWAYS explain it — even if the overall phrase translation is obvious. This rule is absolute: conjugated verb present = explanation required. For verbs, give the infinitive and explain the tense in plain terms (e.g. "they used to have" not "3rd person plural imperfect"). (c) If there is a context-specific note worth adding, put it as a separate string in the array.\n\nBAD example for "trabajadores": explanation: ["'Trabajadores' refers to people who are employed in a job."] — Unnecessary padding.\nGOOD example for "trabajadores": explanation: []\n\nBAD example for "trabajadores había": explanation: [] — Ignores the conjugated verb.\nGOOD example for "trabajadores había": explanation: ["'Haber' means 'to have/there to be'; 'había' is the past tense form meaning 'there were'. 'Trabajadores' means workers.", "In this context, the question asks how many workers there were in the factories."]\n\nBAD example for "Las máquinas tenían información": explanation: [] — The translation is obvious but 'tenían' is still a conjugated verb that must be explained.\nGOOD example for "Las máquinas tenían información": explanation: ["'Tener' means 'to have'; 'tenían' is the past tense form meaning 'they used to have / they had'. 'Máquinas' means machines, 'información' means information.", "In this context, it refers to the special machines in Chilean factories that collected and sent data to the government."]\n\nBAD example for "mató": explanation: ["'Mató' is the 3rd person singular preterite of 'matar' (to kill)."] — Too jargon-heavy.\nGOOD example for "mató": explanation: ["'Matar' means 'to kill'; 'mató' is the past tense form meaning 'he/she killed'."]\n\nGOOD example for "Fue un golpe con ayuda": explanation: ["'Ser' means 'to be'; 'fue' is the past tense form meaning 'it was'. 'Golpe' means blow/coup, 'ayuda' means help.", "In this context, it means the coup did not happen alone — external help was involved."]\n\nReply in JSON: { "translation": "...", "explanation": ["..."] }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content ?? "{}";
    const result = translationResponseSchema.parse(JSON.parse(content));

    await this.db
      .insert(translationCacheSchema)
      .values({
        phrase,
        storyId,
        translation: result.translation,
        explanation: result.explanation,
        createdAt: new Date(),
      })
      .onConflictDoNothing();

    return result;
  }
}
