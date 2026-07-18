export const CONTENT_TYPE_VALUES = ["story", "news"] as const;

export type ContentType = (typeof CONTENT_TYPE_VALUES)[number];
