import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { STORY_LEVEL_VALUES } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'
import { LevelFilter } from '@/features/stories/components/level-filter'

const searchSchema = z.object({
  levels: z.array(z.enum(STORY_LEVEL_VALUES)).optional(),
})

const storiesQueryOptions = queryOptions({
  queryKey: ['stories'],
  queryFn: () => getStories(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storiesQueryOptions)
  },
  head: () => ({
    meta: [
      { property: 'og:url', content: 'https://realspanishstories.com/' },
    ],
    links: [{ rel: 'canonical', href: 'https://realspanishstories.com/' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Real Spanish Stories',
          url: 'https://realspanishstories.com',
          logo: 'https://realspanishstories.com/og-image.jpg',
          sameAs: [
            'https://www.youtube.com/@RealSpanishStories',
            'https://www.instagram.com/realspanishstories/',
            'https://www.tiktok.com/@realspanishstories',
          ],
        }),
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const { data: stories } = useSuspenseQuery(storiesQueryOptions)
  const { levels } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const filteredStories =
    !levels || levels.length === 0
      ? stories
      : stories.filter((s) => levels.includes(s.level))

  function handleLevelChange(newLevels: StoryLevel[] | null) {
    navigate({
      search: (prev) => ({ ...prev, levels: newLevels ?? undefined }),
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          Learn Spanish with Latin American History Stories
        </h1>
        <p className="hidden sm:block text-lg text-gray-600 dark:text-gray-400">
          Real historical stories from Latin America, adapted for four levels.
        </p>
      </div>
      <LevelFilter selected={levels ?? null} onChange={handleLevelChange} />
      <StoryList stories={filteredStories} />
    </div>
  )
}
