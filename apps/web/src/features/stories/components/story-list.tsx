import { StoryListItem } from './story-list-item'
import type { StoryResponse } from '@real-spanish-stories/shared'

interface StoryListProps {
  stories: StoryResponse[]
}

export function StoryList({ stories }: StoryListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryListItem key={story.id} story={story} />
      ))}
    </div>
  )
}
