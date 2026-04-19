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
            ? `${loaderData.altTitle} in ${level?.label ?? ''} Spanish | Real Spanish Stories`
            : 'Real Spanish Stories',
        },
        ...(loaderData?.description
          ? [{ name: 'description', content: loaderData.description }]
          : []),
        ...(loaderData
          ? [
              { property: 'og:type', content: 'article' },
              { property: 'og:title', content: `${loaderData.altTitle} in ${level?.label ?? ''} Spanish | Real Spanish Stories` },
              ...(loaderData.description ? [{ property: 'og:description', content: loaderData.description }] : []),
              { property: 'og:url', content: canonicalUrl },
              ...(loaderData.videoLink
                ? (() => {
                    const match = loaderData.videoLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
                    const videoId = match?.[1]
                    return videoId ? [{ property: 'og:image', content: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }] : []
                  })()
                : []),
            ]
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
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://realspanishstories.com',
                  },
                  ...(level
                    ? [
                        {
                          '@type': 'ListItem',
                          position: 2,
                          name: `${level.label} Spanish Stories`,
                          item: `https://realspanishstories.com/stories/${level.urlSlug}`,
                        },
                      ]
                    : []),
                  {
                    '@type': 'ListItem',
                    position: level ? 3 : 2,
                    name: loaderData.altTitle,
                    item: canonicalUrl,
                  },
                ],
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
