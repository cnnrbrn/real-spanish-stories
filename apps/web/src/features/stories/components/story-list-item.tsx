import { Link } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { getYouTubeThumbnail } from '../utils/video'
import { LevelBadge } from './level-badge'
import type { StoryResponse } from '@real-spanish-stories/shared'

interface StoryListItemProps {
  story: StoryResponse
}

export function StoryListItem({ story }: StoryListItemProps) {
  const thumbnail = story.videoLink
    ? getYouTubeThumbnail(story.videoLink, 'hqdefault')
    : null

  const levelLabel = STORY_LEVELS.find((l) => l.value === story.level)?.label

  return (
    <Link
      to="/story/$slug"
      params={{ slug: story.slug }}
      className="group block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow"
    >
      {thumbnail && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <img
            src={thumbnail}
            alt={`${story.altTitle || story.title}${levelLabel ? ` - ${levelLabel} Spanish` : ''}`}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
            {story.altTitle || story.title}
            {levelLabel ? ` - ${levelLabel} Spanish` : ''}
          </h2>
          <LevelBadge level={story.level} asSpan />
        </div>
      </div>
    </Link>
  )
}
