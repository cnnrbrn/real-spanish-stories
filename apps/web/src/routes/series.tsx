import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStoriesGrouped } from '@/features/stories/api'
import { StoryGroupList } from '@/features/stories/components/story-group-list'

const storiesGroupedQueryOptions = queryOptions({
  queryKey: ['stories', 'grouped'],
  queryFn: () => getStoriesGrouped(),
})

export const Route = createFileRoute('/series')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storiesGroupedQueryOptions)
  },
  head: () => ({
    meta: [
      { title: 'All Spanish Stories | Real Spanish Stories' },
      { property: 'og:url', content: 'https://realspanishstories.com/series' },
    ],
    links: [{ rel: 'canonical', href: 'https://realspanishstories.com/series' }],
  }),
  component: StoriesPage,
})

function StoriesPage() {
  const { data: groups } = useSuspenseQuery(storiesGroupedQueryOptions)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Series</h1>
      <StoryGroupList groups={groups} />
    </div>
  )
}
