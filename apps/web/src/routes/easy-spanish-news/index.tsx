import { Link, createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight, Mic } from 'lucide-react'
import { getNews } from '@/features/news/api'
import { formatNewsDate } from '@/features/news/utils/date'
import { newsHeading } from '@/features/news/utils/title'
import {
  PageContainer,
  pageDescriptionClass,
  pageTitleClass,
} from '@/components/ui/page'

const newsListQueryOptions = queryOptions({
  queryKey: ['news', 'list'],
  queryFn: () => getNews(),
})

const TITLE = 'News in Slow Spanish: Easy Latin American News for Learners'
const DESCRIPTION =
  'Free weekly Latin American news read slowly in clear, easy Argentine Spanish for A2-B1 learners. Full clickable transcripts with instant translation.'
const URL = 'https://realspanishstories.com/easy-spanish-news'
const OG_IMAGE = 'https://realspanishstories.com/og-image.jpg'

export const Route = createFileRoute('/easy-spanish-news/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(newsListQueryOptions),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: URL },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:site_name', content: 'Real Spanish Stories' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: URL }],
  }),
  component: NewsListPage,
})

function NewsListPage() {
  const { data: news } = useSuspenseQuery(newsListQueryOptions)

  return (
    <PageContainer width="prose">
      <h1 className={pageTitleClass}>
        Easy Spanish News - Current Events in Slow, Easy Spanish
      </h1>
      <p className={pageDescriptionClass}>
        Real news from across Latin America, read slowly in clear Argentine
        (Rioplatense) Spanish. A new episode every week, written for A2-B1
        learners — beginner to intermediate — who want real, current Spanish
        they can actually follow by ear, completely free.
      </p>
      <p className={pageDescriptionClass}>
        Every episode comes with a full transcript you can click for instant
        translation, so you can listen first and check anything you missed. Slow
        Spanish news, made for learning.
      </p>

      {news.length === 0 ? (
        <p className="text-muted-foreground">No news items yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {news.map((item) => (
            <li key={item.id}>
              <Link
                to="/easy-spanish-news/$date"
                params={{ date: item.date }}
                className="group flex items-center gap-3 py-4 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Mic className="w-5 h-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {newsHeading(item)}
                  </p>
                  {item.title && (
                    <p className="text-muted-foreground mt-1">
                      {formatNewsDate(item.date)}
                    </p>
                  )}
                  {item.listSummary && (
                    <p className="text-base text-muted-foreground mt-1 line-clamp-2">
                      {item.listSummary}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
