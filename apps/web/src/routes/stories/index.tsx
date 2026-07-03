import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStoriesGrouped } from '@/features/stories/api'
import { StoryGroupList } from '@/features/stories/components/story-group-list'
import { LevelLinks } from '@/features/stories/components/level-links'

const storiesGroupedQueryOptions = queryOptions({
  queryKey: ['stories', 'grouped'],
  queryFn: () => getStoriesGrouped(),
})

const TITLE = 'Spanish Audio Stories for Every Level | Real Spanish Stories'
const DESCRIPTION =
  'Learn Spanish with short audio stories from real Latin American history, graded from beginner to advanced, with human narration, transcripts and translations.'

export const Route = createFileRoute('/stories/')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storiesGroupedQueryOptions)
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: 'https://realspanishstories.com/stories' },
      {
        property: 'og:image',
        content: 'https://realspanishstories.com/og-image.jpg',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://realspanishstories.com/stories' }],
  }),
  component: StoriesPage,
})

function StoriesPage() {
  const { data: groups } = useSuspenseQuery(storiesGroupedQueryOptions)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
        Spanish Audio Stories for Every Level
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Learn Spanish with short audio stories drawn from real Latin American
        history, graded across four levels from absolute beginner to advanced.
        Every story is narrated by a human in clear Argentine (rioplatense)
        Spanish, with an interactive transcript and English translations.
      </p>
      <LevelLinks />
      <StoryGroupList groups={groups} />
    </div>
  )
}
