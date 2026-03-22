export const SECTION_TYPE_VALUES = [
  "title_spanish",
  "title_english",
  "summary",
  "vocabulary_header",
  "vocabulary",
  "verbs_header",
  "verbs",
  "story_header",
  "story",
  "end_card",
] as const;

export type SectionType = (typeof SECTION_TYPE_VALUES)[number];
