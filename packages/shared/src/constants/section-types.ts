export const SECTION_TYPE_VALUES = [
  "title_spanish",
  "title_english",
  "summary",
  "vocabulary_header",
  "vocabulary",
  "verbs_header",
  "verbs",
  "subjunctive_verbs_header",
  "subjunctive_verbs",
  "story_header",
  "story",
] as const;

export type SectionType = (typeof SECTION_TYPE_VALUES)[number];
