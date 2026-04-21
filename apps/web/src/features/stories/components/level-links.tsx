import { Link } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { levelColorClasses } from '../utils/level-colors'
import type { StoryLevel } from '@real-spanish-stories/shared'

interface LevelLinksProps {
  activeLevel?: StoryLevel
}

const baseClasses =
  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors'

const ringClasses =
  'ring-2 ring-gray-900 dark:ring-white ring-offset-2 ring-offset-background'

export function LevelLinks({ activeLevel }: LevelLinksProps) {
  const isAll = activeLevel === undefined

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {isAll ? (
        <span className={`${baseClasses} bg-gray-600 text-white ${ringClasses}`}>
          All
        </span>
      ) : (
        <Link
          to="/"
          className={`${baseClasses} bg-gray-600 text-white hover:bg-gray-700`}
        >
          All
        </Link>
      )}
      {STORY_LEVELS.map(({ value, label, urlSlug }) => {
        const isActive = value === activeLevel
        return isActive ? (
          <span
            key={value}
            className={`${baseClasses} ${levelColorClasses[value]} ${ringClasses}`}
          >
            {label}
          </span>
        ) : (
          <Link
            key={value}
            to="/stories/$levelSlug"
            params={{ levelSlug: urlSlug }}
            className={`${baseClasses} ${levelColorClasses[value]}`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
