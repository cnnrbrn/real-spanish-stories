export const DOWNLOAD_KINDS = ["audio", "pdf-light", "pdf-dark"] as const;

export type DownloadKind = (typeof DOWNLOAD_KINDS)[number];

export const DOWNLOAD_LIMITS_PER_DAY: Record<DownloadKind, number> = {
  audio: 2,
  "pdf-light": 3,
  "pdf-dark": 3,
};

export const PRESIGNED_AUDIO_URL_TTL_SECONDS = 60;
