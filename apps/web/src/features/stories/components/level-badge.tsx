import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'

interface LevelBadgeProps {
  level: StoryLevel
  size?: 'sm' | 'lg'
}

const levelConfig: Record<StoryLevel, { className: string }> = {
  'just-starting': { className: 'bg-level-just-starting text-level-foreground' },
  beginner: { className: 'bg-level-beginner text-level-foreground' },
  intermediate: { className: 'bg-level-intermediate text-level-foreground' },
  advanced: { className: 'bg-level-advanced text-level-foreground' },
}

export function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const config = levelConfig[level]
  const levelData = STORY_LEVELS.find((l) => l.value === level)

  const sizeClasses =
    size === 'lg' ? 'px-4 py-1.5 text-lg' : 'px-2.5 py-0.5 text-base'

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses} ${config.className}`}
    >
      {levelData?.label}
    </span>
  )
}
