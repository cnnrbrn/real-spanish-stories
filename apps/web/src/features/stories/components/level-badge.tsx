import { STORY_LEVELS, type StoryLevel } from '@real-spanish-stories/shared'

interface LevelBadgeProps {
  level: StoryLevel
  size?: 'sm' | 'lg'
}

const levelConfig: Record<StoryLevel, { className: string }> = {
  just_starting: {
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  beginner: {
    className: 'bg-level-beginner text-level-beginner-foreground',
  },
  intermediate: {
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  advanced: {
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  },
}

export function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const config = levelConfig[level]
  const levelData = STORY_LEVELS.find(l => l.value === level)

  const sizeClasses = size === 'lg'
    ? 'px-4 py-1.5 text-sm'
    : 'px-2.5 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.className}`}>
      {levelData?.label}
    </span>
  )
}
