import { Link } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { levelColorClasses } from '../utils/level-colors'
import { getYouTubeThumbnail } from '../utils/video'
import type { StoryGroup } from '@real-spanish-stories/shared'

interface StoryGroupListProps {
  groups: StoryGroup[]
}

export function StoryGroupList({ groups }: StoryGroupListProps) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {groups.map((group) => (
        <li key={group.altTitle} className="py-6">
          <p className="font-semibold text-foreground mb-3">{group.altTitle}</p>
          <div className="flex flex-wrap gap-3">
            {STORY_LEVELS.filter(({ value }) =>
              group.levels.some((l) => l.level === value),
            ).map(({ value, label }) => {
              const levelLink = group.levels.find((l) => l.level === value)!
              const thumbnail = levelLink.videoLink
                ? getYouTubeThumbnail(levelLink.videoLink, 'mqdefault')
                : null

              return (
                <Link
                  key={value}
                  to="/story/$slug"
                  params={{ slug: levelLink.slug }}
                  className="group w-36 shrink-0"
                >
                  <div className="aspect-video rounded-md overflow-hidden bg-muted mb-1.5">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={label}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    )}
                  </div>
                  <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${levelColorClasses[value]}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </li>
      ))}
    </ul>
  )
}
