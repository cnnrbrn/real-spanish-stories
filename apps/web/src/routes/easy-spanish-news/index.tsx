import { Link, createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getNews } from '@/features/news/api'
import { formatNewsDate } from '@/features/news/utils/date'
import { PageContainer, PageHeader } from '@/components/ui/page'

const newsListQueryOptions = queryOptions({
  queryKey: ['news', 'list'],
  queryFn: () => getNews(),
})

const TITLE = 'Easy Spanish News | Real Spanish Stories'
const DESCRIPTION =
  'Daily Spanish news read in clear, easy-to-follow Spanish, with video and transcript for every entry.'

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
    <PageContainer width="wide">
      <PageHeader
        title="Easy Spanish News"
        subtitle="Daily news read in clear, easy-to-follow Spanish, with video and a full transcript."
      />
      {news.length === 0 ? (
        <p className="text-muted-foreground">No news items yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {news.map((item) => (
            <li key={item.id} className="py-4">
              <Link
                to="/easy-spanish-news/$date"
                params={{ date: item.date }}
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                {formatNewsDate(item.date)}
              </Link>
              {item.title && (
                <p className="text-muted-foreground mt-1">{item.title}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
