import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { videoQueryOptions } from '@/features/videos/query-options'
import { SectionsEditor } from '@/features/videos/components/sections-editor'

export const Route = createFileRoute('/videos/$id/sections')({
  loader: async ({ context, params }) => {
    const videoId = parseInt(params.id)
    return context.queryClient.ensureQueryData(videoQueryOptions(videoId))
  },
  component: SectionsPage,
})

function SectionsPage() {
  const { id } = Route.useParams()
  const videoId = parseInt(id)

  const { data: video } = useSuspenseQuery(videoQueryOptions(videoId))

  return <SectionsEditor video={video} />
}
