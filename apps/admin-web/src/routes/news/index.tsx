import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { NewsList } from '@/features/news/components/news-list'
import { listNewsQueryOptions } from '@/features/news/query-options'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/news/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listNewsQueryOptions()),
  component: NewsPage,
})

function NewsPage() {
  const { data: news } = useSuspenseQuery(listNewsQueryOptions())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">News</h1>
        <Button asChild>
          <Link to="/news/new">
            <Plus className="h-4 w-4" />
            New
          </Link>
        </Button>
      </div>
      <NewsList news={news} />
    </div>
  )
}
