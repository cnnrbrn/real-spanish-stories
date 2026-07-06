import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { StoryEditForm } from '@/features/stories/components/story-edit-form'
import { storyByIdQueryOptions } from '@/features/stories/query-options'

export const Route = createFileRoute('/stories/$id/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(storyByIdQueryOptions(Number(params.id))),
  component: StoryEditPage,
})

function StoryEditPage() {
  const { id } = Route.useParams()
  const { data: story } = useSuspenseQuery(storyByIdQueryOptions(Number(id)))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Story</h1>
      <StoryEditForm story={story} />
    </div>
  )
}
