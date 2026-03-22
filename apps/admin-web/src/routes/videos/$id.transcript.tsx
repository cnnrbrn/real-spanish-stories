import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { videoQueryOptions } from '@/features/videos/query-options'
import { TranscriptEditor } from '@/features/videos/components/transcript-editor'

export const Route = createFileRoute('/videos/$id/transcript')({
  loader: async ({ context, params }) => {
    const videoId = parseInt(params.id)
    return context.queryClient.ensureQueryData(videoQueryOptions(videoId))
  },
  component: TranscriptPage,
})

function TranscriptPage() {
  const { id } = Route.useParams()
  const videoId = parseInt(id)

  const { data: video } = useSuspenseQuery(videoQueryOptions(videoId))

  if (!video.transcriptionJson) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Transcript: {video.title}</h1>
        <div className="rounded-lg border border-red-600 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            No transcription data available
          </p>
        </div>
      </div>
    )
  }

  return <TranscriptEditor video={video} />
}
