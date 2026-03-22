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
  component: HomePage,
})

function HomePage() {
  const { data: stories } = useSuspenseQuery(storiesQueryOptions)
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <StoryList stories={stories} />
    </div>
  )
}
