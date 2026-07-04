import { createFileRoute } from '@tanstack/react-router'
import { NewsForm } from '@/features/news/components/news-form'

export const Route = createFileRoute('/news/new')({
  component: NewNewsPage,
})

function NewNewsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create News Item</h1>
      </div>

      <NewsForm />
    </div>
  )
}
