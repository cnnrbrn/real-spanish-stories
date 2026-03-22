import { StoryListItem } from './story-list-item'
import type { Story } from '@real-spanish-stories/shared'

interface StoryListProps {
  stories: Story[]
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
