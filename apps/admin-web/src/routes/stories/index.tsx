import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { StoryList } from '@/features/stories/components/story-list'
import { listStoriesQueryOptions } from '@/features/stories/query-options'

export const Route = createFileRoute('/stories/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listStoriesQueryOptions()),
  component: StoriesPage,
})

function StoriesPage() {
  const { data: stories } = useSuspenseQuery(listStoriesQueryOptions())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stories</h1>
      </div>

      <StoryList stories={stories} />
    </div>
  )
}
