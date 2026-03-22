export const VIDEO_STATUS_VALUES = [
  "draft",
  "transcribing",
  "transcribed",
  "sectioning",
  "sectioned",
  "language_tagging",
  "language_tagged",
  "generating",
  "completed",
  "failed",
] as const;

export type VideoStatus = (typeof VIDEO_STATUS_VALUES)[number];
