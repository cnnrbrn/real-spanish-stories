import { Video } from './video'
import type { Video as VideoType } from '../types'

interface VideoListProps {
  videos: Array<VideoType>
}

export function VideoList({ videos }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No videos found. Create your first video to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {videos.map((video) => (
        <Video key={video.id} video={video} />
      ))}
    </div>
  )
}
