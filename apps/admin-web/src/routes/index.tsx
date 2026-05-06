import { Link, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { VideoList } from "@/features/videos/components/video-list"
import { Button } from "@/components/ui/button"
import { listVideosQueryOptions } from "@/features/videos/query-options"
import { PROCESSING_STATUSES } from "@/features/videos/constants"

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listVideosQueryOptions()),
  component: HomePage,
})

function HomePage() {
  const { data: videos } = useSuspenseQuery({
    ...listVideosQueryOptions(),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some((v) =>
        PROCESSING_STATUSES.includes(
          v.status as (typeof PROCESSING_STATUSES)[number],
        ),
      )
      return hasProcessing ? 10_000 : false
    },
    refetchIntervalInBackground: false,
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/videos/new">Create Video</Link>
        </Button>
      </div>

      <VideoList videos={videos} />
    </div>
  )
}
