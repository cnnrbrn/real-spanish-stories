import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'
import { LevelLinks } from '@/features/stories/components/level-links'
import { PageContainer, PageHeader } from '@/components/ui/page'

const storiesQueryOptions = queryOptions({
  queryKey: ['stories'],
  queryFn: () => getStories(),
})

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storiesQueryOptions)
  },
  head: () => ({
    meta: [{ property: 'og:url', content: 'https://realspanishstories.com/' }],
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

  return (
    <PageContainer width="wide">
      <PageHeader
        className="text-center max-w-5xl mx-auto"
        title="Spanish Listening Practice with Real Latin American Stories"
        subtitle="Short audio stories from real Latin American history, with full transcripts and English translations, across four levels."
      />
      <LevelLinks />
      <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
        Latest Spanish Audio Stories
      </h2>
      <StoryList stories={stories} />
    </PageContainer>
  )
}
