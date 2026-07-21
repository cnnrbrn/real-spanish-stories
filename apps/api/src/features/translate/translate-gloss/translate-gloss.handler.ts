import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { Inject } from "@nestjs/common";
import { Translator } from "deepl-node";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TranslateGlossCommand } from "./translate-gloss.command";
import { GlossResponseDto } from "../translate.dto";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { glossCacheSchema } from "@real-spanish-stories/shared";

@CommandHandler(TranslateGlossCommand)
export class TranslateGlossHandler implements ICommandHandler<TranslateGlossCommand> {
  private readonly translator: Translator;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{ glossCache: typeof glossCacheSchema }>,
  ) {
    this.translator = new Translator(this.configService.getOrThrow("DEEPL_API_KEY"));
  }

  async execute(command: TranslateGlossCommand): Promise<GlossResponseDto> {
    const phrase = command.phrase.toLowerCase().trim();

    // The gloss is context-free, so it is cached globally by phrase and shared
    // across every story and news item.
    const [cached] = await this.db
      .select()
      .from(glossCacheSchema)
      .where(eq(glossCacheSchema.phrase, phrase))
      .limit(1);

    if (cached) {
      return { gloss: cached.gloss };
    }

    const result = await this.translator.translateText(phrase, "es", "en-GB");
    const gloss = result.text;

    await this.db
      .insert(glossCacheSchema)
      .values({ phrase, gloss, createdAt: new Date() })
      .onConflictDoNothing();

    return { gloss };
  }
}
