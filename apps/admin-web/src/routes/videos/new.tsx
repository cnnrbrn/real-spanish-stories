import { createFileRoute } from '@tanstack/react-router'
import { VideoTitleForm } from '@/features/videos/components/video-title-form'

export const Route = createFileRoute('/videos/new')({
  component: NewVideoPage,
})

function NewVideoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Video</h1>
      </div>

      <VideoTitleForm />
    </div>
  )
}
