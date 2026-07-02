import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'

export function createStoryTitle(story: {
  altTitle: string
  level: string | null | undefined
}): string {
  const levelLabel = story.level
    ? STORY_LEVELS.find((l) => l.value === story.level)?.label
    : null

  return `${levelLabel ? `${levelLabel} Spanish - ` : ''}${story.altTitle}`
}

interface StorySeoMeta {
  keyword: string
  suffix: string
}

const STORY_SEO_META: Record<StoryLevel, StorySeoMeta> = {
  'absolute-beginner': {
    keyword: 'Absolute Beginner Spanish Listening',
    suffix: '(with Transcript)',
  },
  beginner: {
    keyword: 'Beginner Spanish Listening Practice',
    suffix: '(A1-A2)',
  },
  intermediate: {
    keyword: 'Intermediate Spanish Listening Practice',
    suffix: '(A2-B1)',
  },
  advanced: {
    keyword: 'Advanced Spanish Listening Practice',
    suffix: '(B1-B2)',
  },
}

export function createStorySeoTitle(story: {
  altTitle: string
  level: string | null | undefined
}): string {
  const meta = story.level
    ? STORY_SEO_META[story.level as StoryLevel]
    : undefined
  if (!meta) return story.altTitle

  const base = `${meta.keyword}: ${story.altTitle} ${meta.suffix}`
  const withSuffix = `${base} | Real Spanish Stories`
  return withSuffix.length > 60 ? base : withSuffix
}
