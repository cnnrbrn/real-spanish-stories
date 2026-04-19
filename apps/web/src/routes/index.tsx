import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'
import { LevelLinks } from '@/features/stories/components/level-links'

const storiesQueryOptions = queryOptions({
  queryKey: ['stories'],
  queryFn: () => getStories(),
})

export const Route = createFileRoute('/')({
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
      <LevelLinks />
      <StoryList stories={stories} />
    </div>
  )
}
