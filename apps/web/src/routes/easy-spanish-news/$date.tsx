import { createFileRoute } from '@tanstack/react-router'
import { getNewsByDate } from '@/features/news/api'
import { formatNewsDate } from '@/features/news/utils/date'
import { NewsDetails } from '@/features/news/components/news-details'

export const Route = createFileRoute('/easy-spanish-news/$date')({
  loader: async ({ params }) => getNewsByDate(params.date),
  head: ({ loaderData, params }) => {
    const canonicalUrl = `https://realspanishstories.com/easy-spanish-news/${params.date}`
    const formattedDate = formatNewsDate(params.date)
    const seoTitle = loaderData?.title
      ? `${loaderData.title} | Easy Spanish News`
      : `Easy Spanish News: ${formattedDate}`

    return {
      meta: [
        { title: seoTitle },
        ...(loaderData?.metaDescription
          ? [{ name: 'description', content: loaderData.metaDescription }]
          : []),
        ...(loaderData
          ? [
              { property: 'og:type', content: 'article' },
              { property: 'og:title', content: seoTitle },
              { property: 'og:url', content: canonicalUrl },
              ...(loaderData.metaDescription
                ? [
                    {
                      property: 'og:description',
                      content: loaderData.metaDescription,
                    },
                  ]
                : []),
            ]
          : []),
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: loaderData
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'NewsArticle',
                headline: loaderData.title ?? formattedDate,
                ...(loaderData.metaDescription
                  ? { description: loaderData.metaDescription }
                  : {}),
                url: canonicalUrl,
                inLanguage: 'es',
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
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Easy Spanish News',
                    item: 'https://realspanishstories.com/easy-spanish-news',
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: loaderData.title ?? formattedDate,
                    item: canonicalUrl,
                  },
                ],
              }),
            },
          ]
        : [],
    }
  },
  component: NewsDetailPage,
})

function NewsDetailPage() {
  const news = Route.useLoaderData()
  return <NewsDetails news={news} />
}
