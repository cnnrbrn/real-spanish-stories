import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { getNewsByDate } from '@/features/news/api'
import { formatNewsDate } from '@/features/news/utils/date'
import { PageContainer, PageHeader } from '@/components/ui/page'
import { VideoPlayer } from '@/features/stories/components/video-player'

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
        ...(loaderData
          ? [
              { property: 'og:type', content: 'article' },
              { property: 'og:title', content: seoTitle },
              { property: 'og:url', content: canonicalUrl },
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
  const formattedDate = formatNewsDate(news.date)

  return (
    <PageContainer width="wide">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/easy-spanish-news" className="hover:text-primary transition-colors">
          Easy Spanish News
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{news.title ?? formattedDate}</span>
      </nav>
      <PageHeader title={news.title ?? formattedDate} subtitle={news.title ? formattedDate : undefined} />
      {news.videoLink && (
        <div className="mb-6 aspect-video bg-black">
          <VideoPlayer videoUrl={news.videoLink} />
        </div>
      )}
      {news.transcript && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: news.transcript }}
        />
      )}
    </PageContainer>
  )
}
