export const STORY_LEVEL_VALUES = [
  "absolute-beginner",
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const STORY_LEVELS = [
  { value: "absolute-beginner", label: "Absolute Beginner", labelEs: "Empezando",    urlSlug: "absolute-beginner-spanish-stories" },
  { value: "beginner",      label: "Beginner",      labelEs: "Principiante", urlSlug: "beginner-spanish-stories" },
  { value: "intermediate",  label: "Intermediate",  labelEs: "Intermedio",   urlSlug: "intermediate-spanish-stories" },
  { value: "advanced",      label: "Advanced",      labelEs: "Avanzado",     urlSlug: "advanced-spanish-stories" },
] as const;

export type StoryLevel = typeof STORY_LEVEL_VALUES[number];
