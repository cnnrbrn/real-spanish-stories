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

  if (!video.sectionsJson) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Sections: {video.title}</h1>
        <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-900">
            No sections detected yet. Go to the transcript editor and click "Detect Sections".
          </p>
        </div>
      </div>
    )
  }

  return <SectionsEditor video={video} />
}
