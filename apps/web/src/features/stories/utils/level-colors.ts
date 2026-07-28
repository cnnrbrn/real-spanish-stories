import type { StoryLevel } from '@real-spanish-stories/shared'

export const levelColorClasses: Record<StoryLevel, string> = {
  'absolute-beginner': 'bg-level-absolute-beginner text-level-foreground',
  beginner: 'bg-level-beginner text-level-foreground',
  intermediate: 'bg-level-intermediate text-level-foreground',
  advanced: 'bg-level-advanced text-level-foreground',
}

/** Outline counterpart to the filled badge: border and label both in the level colour. */
export const levelOutlineClasses: Record<StoryLevel, string> = {
  'absolute-beginner':
    'border-level-absolute-beginner text-level-absolute-beginner',
  beginner: 'border-level-beginner text-level-beginner',
  intermediate: 'border-level-intermediate text-level-intermediate',
  advanced: 'border-level-advanced text-level-advanced',
}
