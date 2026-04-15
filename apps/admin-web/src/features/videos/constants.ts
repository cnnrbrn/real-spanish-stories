export const TRANSCRIPTION_SERVICES = {
  LOCAL_WHISPERX: "local-whisperx",
  REPLICATE: "replicate",
  DEEPGRAM: "deepgram",
} as const

export const TRANSCRIPTION_SERVICE_OPTIONS = [
  TRANSCRIPTION_SERVICES.LOCAL_WHISPERX,
  TRANSCRIPTION_SERVICES.REPLICATE,
  TRANSCRIPTION_SERVICES.DEEPGRAM,
] as const

export type TranscriptionService =
  (typeof TRANSCRIPTION_SERVICE_OPTIONS)[number]

export { STORY_LEVELS as VIDEO_LEVELS } from "@real-spanish-stories/shared"
export type { StoryLevel as VideoLevel } from "@real-spanish-stories/shared"

export const PROCESSING_STATUSES = [
  "transcribing",
  "aligning",
  "sectioning",
  "language_tagging",
  "generating",
] as const

export const videoKeys = {
  all: ["videos"] as const,
  list: () => [...videoKeys.all, "list"] as const,
  details: () => [...videoKeys.all, "details"] as const,
  detail: (id: number) => [...videoKeys.details(), id] as const,
}
