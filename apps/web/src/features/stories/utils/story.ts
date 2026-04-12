import { STORY_LEVELS } from '@real-spanish-stories/shared'

export function createStoryTitle(story: {
  altTitle: string
  level: string | null | undefined
}): string {
  const levelLabel = story.level
    ? STORY_LEVELS.find((l) => l.value === story.level)?.label
    : null

  return `${story.altTitle}${levelLabel ? ` - ${levelLabel} Spanish` : ''}`
}
