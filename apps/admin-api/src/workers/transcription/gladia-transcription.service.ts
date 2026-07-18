import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  RawTranscriptionWord,
  TranscriptionResult,
} from "@real-spanish-stories/shared";

const GLADIA_UPLOAD_URL = "https://api.gladia.io/v2/upload";
const GLADIA_TRANSCRIBE_URL = "https://api.gladia.io/v2/pre-recorded";
const GLADIA_POLL_INTERVAL_MS = 3000;
const GLADIA_POLL_TIMEOUT_MS = 15 * 60 * 1000;

interface GladiaWord {
  word?: string;
  start?: number;
  end?: number;
}

interface GladiaUtterance {
  text?: string;
  words?: GladiaWord[];
}

interface GladiaResult {
  status?: string;
  error?: unknown;
  result?: {
    transcription?: {
      full_transcript?: string;
      utterances?: GladiaUtterance[];
    };
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class GladiaTranscriptionService {
  private readonly logger = new Logger(GladiaTranscriptionService.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow("GLADIA_API_KEY");
  }

  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    this.logger.log("Starting Gladia transcription");

    const audioUrl = await this.uploadAudio(audioBuffer);
    const resultUrl = await this.requestTranscription(audioUrl);
    const result = await this.pollForResult(resultUrl);

    const utterances = result.result?.transcription?.utterances ?? [];
    const words: RawTranscriptionWord[] = [];
    for (const utterance of utterances) {
      for (const word of utterance.words ?? []) {
        words.push({
          word: word.word ?? "",
          start: word.start ?? 0,
          end: word.end ?? 0,
        });
      }
    }

    const text =
      result.result?.transcription?.full_transcript ??
      utterances.map((u) => (u.text ?? "").trim()).join(" ");

    this.logger.log(`Gladia transcription complete: ${words.length} words`);

    return { text, words, segments: [] };
  }

  private async uploadAudio(audioBuffer: Buffer): Promise<string> {
    const form = new FormData();
    form.append(
      "audio",
      new Blob([new Uint8Array(audioBuffer)]),
      "audio.wav",
    );

    const response = await fetch(GLADIA_UPLOAD_URL, {
      method: "POST",
      headers: { "x-gladia-key": this.apiKey },
      body: form,
    });

    if (!response.ok) {
      throw new Error(
        `Gladia upload failed: ${response.status} ${await response.text()}`,
      );
    }

    const data = (await response.json()) as { audio_url?: string };
    if (!data.audio_url) {
      throw new Error("Gladia upload returned no audio_url");
    }
    return data.audio_url;
  }

  private async requestTranscription(audioUrl: string): Promise<string> {
    const response = await fetch(GLADIA_TRANSCRIBE_URL, {
      method: "POST",
      headers: {
        "x-gladia-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        model: "solaria-3",
        language_config: {
          languages: ["es"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gladia transcription request failed: ${response.status} ${await response.text()}`,
      );
    }

    const data = (await response.json()) as {
      result_url?: string;
      id?: string;
    };
    const resultUrl =
      data.result_url ??
      (data.id ? `${GLADIA_TRANSCRIBE_URL}/${data.id}` : undefined);
    if (!resultUrl) {
      throw new Error("Gladia transcription request returned no result_url");
    }
    return resultUrl;
  }

  private async pollForResult(resultUrl: string): Promise<GladiaResult> {
    const deadline = Date.now() + GLADIA_POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const response = await fetch(resultUrl, {
        headers: { "x-gladia-key": this.apiKey },
      });

      if (!response.ok) {
        throw new Error(
          `Gladia poll failed: ${response.status} ${await response.text()}`,
        );
      }

      const data = (await response.json()) as GladiaResult;

      if (data.status === "done") {
        return data;
      }
      if (data.status === "error") {
        throw new Error(
          `Gladia transcription errored: ${JSON.stringify(data.error)}`,
        );
      }

      await sleep(GLADIA_POLL_INTERVAL_MS);
    }

    throw new Error("Gladia transcription timed out");
  }
}
