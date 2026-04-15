export const STORY_LEVEL_VALUES = [
  "just-starting",
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const STORY_LEVELS = [
  { value: "just-starting", label: "Just Starting", labelEs: "Empezando" },
  { value: "beginner", label: "Beginner", labelEs: "Principiante" },
  { value: "intermediate", label: "Intermediate", labelEs: "Intermedio" },
  { value: "advanced", label: "Advanced", labelEs: "Avanzado" },
] as const;

export type StoryLevel = typeof STORY_LEVEL_VALUES[number];
