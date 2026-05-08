import { Link } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { levelColorClasses } from '../utils/level-colors'
import type { StoryLevel } from '@real-spanish-stories/shared'

interface LevelBadgeProps {
  level: StoryLevel
  size?: 'sm' | 'lg'
  asSpan?: boolean
}

export function LevelBadge({ level, size = 'sm', asSpan = false }: LevelBadgeProps) {
  const levelData = STORY_LEVELS.find((l) => l.value === level)
  const sizeClasses =
    size === 'lg' ? 'px-4 py-1.5 text-lg' : 'px-2.5 py-0.5 text-base'
  const className = `inline-flex items-center rounded-md font-medium ${sizeClasses} ${levelColorClasses[level]}`

  if (asSpan) {
    return <span className={className}>{levelData?.label}</span>
  }

  return (
    <Link
      to="/stories/$levelSlug"
      params={{ levelSlug: levelData?.urlSlug ?? '' }}
      className={className}
    >
      {levelData?.label}
    </Link>
  )
}
