export const STORY_STATUS_VALUES = ["draft", "published"] as const;

export type StoryStatus = (typeof STORY_STATUS_VALUES)[number];
