import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'

const storiesQueryOptions = queryOptions({
  queryKey: ['stories'],
  queryFn: () => getStories(),
})

export const Route = createFileRoute('/')({
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
      <StoryList stories={stories} />
    </div>
  )
}
