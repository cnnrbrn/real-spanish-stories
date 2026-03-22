export const STORY_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export type StoryStatus = typeof STORY_STATUSES[keyof typeof STORY_STATUSES]

export const storyKeys = {
  all: ['stories'] as const,
  list: () => [...storyKeys.all, 'list'] as const,
  byVideo: (videoId: number) => [...storyKeys.all, 'by-video', videoId] as const,
}
