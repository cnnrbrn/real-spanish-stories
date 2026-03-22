import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { videoQueryOptions } from "@/features/videos/query-options"
import { LanguageTaggedEditor } from "@/features/videos/components/language-tagged-editor"

export const Route = createFileRoute("/videos/$id/language-tagged")({
  loader: async ({ context, params }) => {
    const videoId = parseInt(params.id)
    try {
      await context.queryClient.fetchQuery(videoQueryOptions(videoId))
    } catch (e) {
      return redirect({ to: `/` })
    }
  },

  component: LanguageTaggedPage,
})

function LanguageTaggedPage() {
  const { id } = Route.useParams()
  const videoId = parseInt(id)

  const { data: video } = useSuspenseQuery(videoQueryOptions(videoId))

  if (!video.languageTaggedJson) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Language Tags: {video.title}</h1>
        <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-900">
            No language tags yet. Go to the sections editor and click "Tag
            Languages".
          </p>
        </div>
      </div>
    )
  }

  return <LanguageTaggedEditor video={video} />
}
