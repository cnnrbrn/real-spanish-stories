import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { StoryAudioForm } from '@/features/stories/components/story-audio-form'
import { storyByIdQueryOptions } from '@/features/stories/query-options'

export const Route = createFileRoute('/stories/$id/audio')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(storyByIdQueryOptions(Number(params.id))),
  component: StoryAudioPage,
})

function StoryAudioPage() {
  const { id } = Route.useParams()
  const { data: story } = useSuspenseQuery(storyByIdQueryOptions(Number(id)))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {story.audioFilename ? 'Replace Audio' : 'Upload Audio'}: {story.title}
      </h1>
      {story.audioFilename && (
        <p className="text-sm text-muted-foreground">
          Current file: {story.audioFilename}
        </p>
      )}
      <StoryAudioForm story={story} />
    </div>
  )
}
