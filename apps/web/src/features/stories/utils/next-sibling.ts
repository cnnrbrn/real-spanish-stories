import {
  STORY_LEVEL_VALUES,
  type StoryLevel,
  type StoryResponse,
} from '@real-spanish-stories/shared'

export function findNextSibling(
  currentLevel: StoryLevel,
  siblings: StoryResponse[],
): StoryResponse | null {
  const currentIdx = STORY_LEVEL_VALUES.indexOf(currentLevel)
  if (currentIdx < 0) return null

  for (let i = currentIdx + 1; i < STORY_LEVEL_VALUES.length; i++) {
    const nextLevel = STORY_LEVEL_VALUES[i]
    const sibling = siblings.find((s) => s.level === nextLevel)
    if (sibling) return sibling
  }

  return null
}
