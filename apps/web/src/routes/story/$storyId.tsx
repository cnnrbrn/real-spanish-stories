import { createFileRoute } from '@tanstack/react-router'
import { capitalizeFirstLetter } from '@real-spanish-stories/shared'
import { getStoryById } from '@/features/stories/api'
import { StoryDetails } from '@/features/stories/components/story-details'

export const Route = createFileRoute('/story/$storyId')({
  loader: async ({ params }) => {
    const storyId = Number(params.storyId)
    const story = await getStoryById(storyId)
    return story
  },
  head: function ({ loaderData }) {
    return {
      meta: [
        {
          title: loaderData
            ? `${loaderData.altTitle} | ${capitalizeFirstLetter(loaderData.level)} Spanish | Real Spanish Stories`
            : 'Real Spanish Stories',
        },
      ],
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const story = Route.useLoaderData()

  return <StoryDetails story={story} />
}
