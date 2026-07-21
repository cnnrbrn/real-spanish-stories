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

const TITLE = 'Easy Spanish News: Slow Spanish Listening with Transcripts'
const DESCRIPTION =
  'Weekly Latin American news read slowly in clear, easy Argentine Spanish for learners, with video and full transcripts you can click for instant translation.'

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
      {
        property: 'og:url',
        content: 'https://realspanishstories.com/easy-spanish-news',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://realspanishstories.com/easy-spanish-news',
      },
    ],
  }),
  component: NewsListPage,
})

function NewsListPage() {
  const { data: news } = useSuspenseQuery(newsListQueryOptions)

  return (
    <PageContainer width="prose">
      <h1 className={pageTitleClass}>Easy Spanish News</h1>
      <p className={pageDescriptionClass}>
        Weekly Latin American news read in clear, slow Argentine (rioplatense)
        Spanish, with a full transcript you can click for translation.
      </p>
      <p className={pageDescriptionClass}>
        New episode every week, narrated in clear Argentine (rioplatense)
        Spanish. Perfect listening practice for beginner and intermediate
        learners who want real, current Spanish.
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
