import { Link } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { levelColorClasses } from '../utils/level-colors'
import { getYouTubeThumbnail } from '../utils/video'
import type { StoryLevel, StoryResponse } from '@real-spanish-stories/shared'

interface LevelProgressionPanelProps {
  currentLevel: StoryLevel
  levels: StoryResponse[]
  altTitle: string
}

export function LevelProgressionPanel({ currentLevel, levels, altTitle }: LevelProgressionPanelProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">All levels</p>
      <h2 className="text-base font-semibold text-foreground mb-3">{altTitle}</h2>
      <ul className="space-y-2">
        {STORY_LEVELS.map(({ value, label }) => {
          const story = levels.find((s) => s.level === value)
          const isCurrent = value === currentLevel
          const thumbnail = story?.videoLink ? getYouTubeThumbnail(story.videoLink, 'mqdefault') : null

          const content = (
            <div className={`flex items-center gap-3 rounded-lg p-1 -mx-1 transition-colors ${isCurrent ? 'bg-muted' : 'hover:bg-muted/60'} ${!story ? 'opacity-40' : ''}`}>
              <div className="w-20 aspect-video rounded overflow-hidden bg-muted shrink-0">
                {thumbnail && <img src={thumbnail} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded mb-1 ${levelColorClasses[value]}`}>
                  {label}
                </span>
                <p className="text-xs text-foreground/80 truncate">
                  {story ? story.altTitle : 'Coming soon'}
                </p>
              </div>
            </div>
          )

          return (
            <li key={value}>
              {isCurrent || !story ? content : (
                <Link to="/story/$slug" params={{ slug: story.slug }}>
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
