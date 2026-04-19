import { createFileRoute } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { getStoryBySlug } from '@/features/stories/api'
import { StoryDetails } from '@/features/stories/components/story-details'

export const Route = createFileRoute('/story/$slug')({
  loader: async ({ params }) => {
    return getStoryBySlug(params.slug)
  },
  head: function ({ loaderData, params }) {
    const canonicalUrl = `https://realspanishstories.com/story/${params.slug}`
    const level = STORY_LEVELS.find((l) => l.value === loaderData?.level)

    return {
      meta: [
        {
          title: loaderData
            ? `${loaderData.altTitle} | ${level?.label ?? ''} | Real Spanish Stories`
            : 'Real Spanish Stories',
        },
        ...(loaderData?.description
          ? [{ name: 'description', content: loaderData.description }]
          : []),
      ],
      links: [
        {
          rel: 'canonical',
          href: canonicalUrl,
        },
      ],
      scripts: loaderData
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': ['Article', 'LearningResource'],
                headline: loaderData.altTitle,
                ...(loaderData.description && {
                  description: loaderData.description,
                }),
                url: canonicalUrl,
                inLanguage: 'es',
                teaches: 'Spanish language',
                learningResourceType: 'Story',
                ...(level && { educationalLevel: level.label }),
                datePublished: new Date(loaderData.createdAt).toISOString(),
                dateModified: new Date(loaderData.updatedAt).toISOString(),
                publisher: {
                  '@type': 'Organization',
                  name: 'Real Spanish Stories',
                  url: 'https://realspanishstories.com',
                },
              }),
            },
          ]
        : [],
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const story = Route.useLoaderData()

  return <StoryDetails story={story} />
}
