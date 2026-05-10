import { useEffect } from 'react'
import type { StoryResponse } from '@real-spanish-stories/shared'
import { setOrder } from '../utils/audio-coordinator'
import { StoryAudioRow } from './story-audio-row'

interface StoryRowListProps {
  stories: StoryResponse[]
}

export function StoryRowList({ stories }: StoryRowListProps) {
  useEffect(() => {
    setOrder(stories.map((s) => s.id))
  }, [stories])

  return (
    <div className="flex flex-col gap-3">
      {stories.map((story) => (
        <StoryAudioRow key={story.id} story={story} />
      ))}
    </div>
  )
}
