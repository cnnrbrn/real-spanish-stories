import type { Transcription } from "../schemas/transcription.schema.js";

export function storyStartMsFromTranscription(
  transcription: Transcription | null | undefined,
): number | null {
  const section = transcription?.sections.find((s) => s.type === "story");
  if (!section) return null;
  return Math.round(section.start_time * 1000);
}
