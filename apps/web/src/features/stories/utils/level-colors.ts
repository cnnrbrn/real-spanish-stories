import type { StoryLevel } from '@real-spanish-stories/shared'

export const levelColorClasses: Record<StoryLevel, string> = {
  'just-starting': 'bg-level-just-starting text-level-foreground',
  beginner: 'bg-level-beginner text-level-foreground',
  intermediate: 'bg-level-intermediate text-level-foreground',
  advanced: 'bg-level-advanced text-level-foreground',
}
