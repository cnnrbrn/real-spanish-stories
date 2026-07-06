import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { NewsEditForm } from '@/features/news/components/news-edit-form'
import { newsDetailQueryOptions } from '@/features/news/query-options'

export const Route = createFileRoute('/news/$id/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(newsDetailQueryOptions(Number(params.id))),
  component: NewsEditPage,
})

function NewsEditPage() {
  const { id } = Route.useParams()
  const { data: news } = useSuspenseQuery(newsDetailQueryOptions(Number(id)))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit News Item</h1>
      <NewsEditForm news={news} />
    </div>
  )
}
