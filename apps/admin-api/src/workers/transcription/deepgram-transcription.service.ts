import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeepgramClient } from "@deepgram/sdk";
import type {
  RawTranscriptionWord,
  TranscriptionResult,
} from "@real-spanish-stories/shared";

@Injectable()
export class DeepgramTranscriptionService {
  private readonly logger = new Logger(DeepgramTranscriptionService.name);
  private readonly deepgram: DeepgramClient;

  constructor(private readonly configService: ConfigService) {
    this.deepgram = new DeepgramClient({
      apiKey: this.configService.getOrThrow("DEEPGRAM_API_KEY"),
    });
  }

  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    this.logger.log("Starting Deepgram Nova-3 transcription");

    let response;
    try {
      response = await this.deepgram.listen.v1.media.transcribeFile(
        audioBuffer,
        {
          model: "nova-3",
          language: "multi",
          smart_format: true,
        },
      );
    } catch (error) {
      this.logger.error("Deepgram API call failed", error);
      throw error;
    }

    const channels = (response as { results?: { channels?: { alternatives?: { transcript?: string; words?: { word?: string; start?: number; end?: number }[] }[] }[] } }).results?.channels;
    const alternative = channels?.[0]?.alternatives?.[0];

    if (!alternative) {
      throw new Error("Deepgram returned no transcription results");
    }

    const words: RawTranscriptionWord[] = (alternative.words ?? []).map(
      (w: { word?: string; punctuated_word?: string; start?: number; end?: number }) => ({
        word: w.punctuated_word ?? w.word ?? "",
        start: w.start ?? 0,
        end: w.end ?? 0,
      }),
    );

    const text = alternative.transcript ?? "";

    this.logger.log(
      `Deepgram transcription complete: ${words.length} words`,
    );

    return { text, words, segments: [] };
  }
}
