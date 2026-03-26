import { Story } from './story'
import type { Story as StoryType } from '../types'

interface StoryListProps {
  stories: Array<StoryType>
}

export function StoryList({ stories }: StoryListProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No stories found. Create stories from videos with language tags.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {stories.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </div>
  )
}
