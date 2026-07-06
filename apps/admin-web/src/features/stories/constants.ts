export type { StoryStatus } from "@real-spanish-stories/shared"

export const STORY_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export const storyKeys = {
  all: ['stories'] as const,
  list: () => [...storyKeys.all, 'list'] as const,
  detail: (id: number) => [...storyKeys.all, 'detail', id] as const,
  byVideo: (videoId: number) => [...storyKeys.all, 'by-video', videoId] as const,
}
