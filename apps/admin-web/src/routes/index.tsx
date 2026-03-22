import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { VideoList } from '@/features/videos/components/video-list'
import { Button } from '@/components/ui/button'
import { listVideosQueryOptions } from '@/features/videos/query-options'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listVideosQueryOptions()),
  component: HomePage,
})

function HomePage() {
  const { data: videos } = useSuspenseQuery(listVideosQueryOptions())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Button asChild>
          <Link to="/videos/new">Create Video</Link>
        </Button>
      </div>

      <VideoList videos={videos} />
    </div>
  )
}
