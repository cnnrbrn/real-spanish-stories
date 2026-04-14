import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'

interface LevelFilterProps {
  selected: StoryLevel[] | null
  onChange: (levels: StoryLevel[] | null) => void
}

const levelConfig: Record<StoryLevel, string> = {
  just_starting: 'bg-level-just-starting text-level-foreground',
  beginner: 'bg-level-beginner text-level-foreground',
  intermediate: 'bg-level-intermediate text-level-foreground',
  advanced: 'bg-level-advanced text-level-foreground',
}

const baseClasses =
  'rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors'

const ringClasses =
  'ring-2 ring-gray-900 dark:ring-white ring-offset-2 ring-offset-background'

export function LevelFilter({ selected, onChange }: LevelFilterProps) {
  const isAll = selected === null || selected.length === 0

  function handleAll() {
    onChange(null)
  }

  function handleLevel(level: StoryLevel) {
    if (isAll) {
      onChange([level])
      return
    }
    const next = selected.includes(level)
      ? selected.filter((l) => l !== level)
      : [...selected, level]
    onChange(next.length === 0 ? null : next)
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <button
        type="button"
        onClick={handleAll}
        className={`${baseClasses} bg-gray-600 text-white ${isAll ? ringClasses : ''}`}
      >
        All
      </button>
      {STORY_LEVELS.map(({ value, label }) => {
        const isActive = !isAll && selected.includes(value)
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleLevel(value)}
            className={`${baseClasses} ${levelConfig[value]} ${isActive ? ringClasses : ''}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
