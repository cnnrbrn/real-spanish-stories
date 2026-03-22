export const TRANSCRIPTION_SERVICES = {
  LOCAL_WHISPERX: "local-whisperx",
  REPLICATE: "replicate",
} as const

export const TRANSCRIPTION_SERVICE_OPTIONS = [
  TRANSCRIPTION_SERVICES.LOCAL_WHISPERX,
  TRANSCRIPTION_SERVICES.REPLICATE,
] as const

export type TranscriptionService =
  (typeof TRANSCRIPTION_SERVICE_OPTIONS)[number]

export const VIDEO_LEVELS = [
  { value: "just_starting", label: "Just Starting" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const

export type VideoLevel = (typeof VIDEO_LEVELS)[number]["value"]

export const videoKeys = {
  all: ["videos"] as const,
  list: () => [...videoKeys.all, "list"] as const,
  details: () => [...videoKeys.all, "details"] as const,
  detail: (id: number) => [...videoKeys.details(), id] as const,
}
