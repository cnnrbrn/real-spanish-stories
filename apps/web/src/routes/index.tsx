import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { STORY_LEVEL_VALUES } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'
import { LevelFilter } from '@/features/stories/components/level-filter'

const storiesQueryOptions = queryOptions({
  queryKey: ['stories'],
  queryFn: () => getStories(),
})

const searchSchema = z.object({
  levels: z
    .union([
      z.enum(STORY_LEVEL_VALUES).transform((v) => [v]),
      z.array(z.enum(STORY_LEVEL_VALUES)),
    ])
    .optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storiesQueryOptions)
  },
  head: () => ({
    links: [{ rel: 'canonical', href: 'https://realspanishstories.com/' }],
  }),
  component: HomePage,
})

function HomePage() {
  const { data: stories } = useSuspenseQuery(storiesQueryOptions)
  const { levels } = Route.useSearch()
  const navigate = useNavigate({ from: '/' })

  const selected: StoryLevel[] | null =
    levels && levels.length > 0 ? levels : null

  const filteredStories =
    selected === null
      ? stories
      : stories.filter((s) => selected.includes(s.level))

  function handleFilterChange(next: StoryLevel[] | null) {
    navigate({
      search: next === null ? {} : { levels: next },
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          Learn Spanish with Latin American History Stories
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real historical stories from Latin America, adapted for four levels:{' '}
          <br />
          <strong>Just Starting</strong>, <strong>Beginner</strong>,{' '}
          <strong>Intermediate</strong>, and <strong>Advanced</strong>.
        </p>
      </div>
      {/* <LevelFilter selected={selected} onChange={handleFilterChange} /> */}
      <StoryList stories={filteredStories} />
    </div>
  )
}
