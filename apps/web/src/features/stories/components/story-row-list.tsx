import type { StoryResponse } from '@real-spanish-stories/shared'
import { StoryAudioRow } from './story-audio-row'

interface StoryRowListProps {
  stories: StoryResponse[]
}

export function StoryRowList({ stories }: StoryRowListProps) {
  return (
    <div className="flex flex-col gap-3">
      {stories.map((story) => (
        <StoryAudioRow key={story.id} story={story} />
      ))}
    </div>
  )
}
