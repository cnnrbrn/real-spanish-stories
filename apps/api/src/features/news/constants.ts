export const NEWS_DOWNLOAD_KINDS = ["pdf"] as const;

export type NewsDownloadKind = (typeof NEWS_DOWNLOAD_KINDS)[number];

export const NEWS_DOWNLOAD_LIMITS_PER_DAY: Record<NewsDownloadKind, number> = {
  pdf: 3,
};
