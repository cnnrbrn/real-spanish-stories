import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Replicate from "replicate";
import type {
  RawTranscriptionWord,
  TranscriptionResult,
} from "@real-spanish-stories/shared";

@Injectable()
export class ReplicateTranscriptionService {
  private readonly logger = new Logger(ReplicateTranscriptionService.name);
  private readonly replicate: Replicate;

  constructor(private readonly configService: ConfigService) {
    this.replicate = new Replicate({
      auth: this.configService.getOrThrow("REPLICATE_API_TOKEN"),
    });
  }

  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    this.logger.log("Starting Replicate WhisperX transcription");

    const output = (await this.replicate.run(
      "victor-upmeet/whisperx:84d2ad2d6194fe98a17d2b60bef1c7f910c46b2f6fd38996ca457afd9c8abfcb",
      {
        input: {
          audio_file: audioBuffer,
          align_output: true,
          batch_size: 16,
          temperature: 0,
          initial_prompt:
            "This is a bilingual Spanish and English educational video. Do not translate anything. Transcribe exactly as spoken, preserving both Spanish and English words. Dates, numbers, and words may be repeated in both languages.",
        },
      },
    )) as {
      segments?: {
        text?: string;
        words?: { word?: string; start?: number; end?: number }[];
      }[];
    };

    const segments = output.segments ?? [];
    this.logger.log(`Replicate returned ${segments.length} segments`);

    const words: RawTranscriptionWord[] = [];
    for (const segment of segments) {
      for (const wordData of segment.words ?? []) {
        words.push({
          word: wordData.word ?? "",
          start: wordData.start ?? 0,
          end: wordData.end ?? 0,
        });
      }
    }

    const text = segments.map((seg) => (seg.text ?? "").trim()).join(" ");

    return { text, words, segments };
  }
}
