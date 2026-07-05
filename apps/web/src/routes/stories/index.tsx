import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStoriesGrouped } from '@/features/stories/api'
import { StoryGroupList } from '@/features/stories/components/story-group-list'
import { LevelLinks } from '@/features/stories/components/level-links'
import {
  PageContainer,
  pageDescriptionClass,
  pageHeaderCenteredClass,
  pageTitleClass,
} from '@/components/ui/page'

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
    <PageContainer width="wide">
      <div className={pageHeaderCenteredClass}>
        <h1 className={pageTitleClass}>
          Spanish Audio Stories for Every Level
        </h1>
        <p className={pageDescriptionClass}>
          Learn Spanish with short audio stories drawn from real Latin
          American history, graded across four levels from absolute beginner
          to advanced. Every story is narrated by a human in clear Argentine
          (rioplatense) Spanish, with an interactive transcript and English
          translations.
        </p>
      </div>
      <LevelLinks />
      <StoryGroupList groups={groups} />
    </PageContainer>
  )
}
