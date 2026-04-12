import { createFileRoute } from '@tanstack/react-router'
import { capitalizeFirstLetter } from '@real-spanish-stories/shared'
import { getStoryBySlug } from '@/features/stories/api'
import { StoryDetails } from '@/features/stories/components/story-details'

export const Route = createFileRoute('/story/$slug')({
  loader: async ({ params }) => {
    return getStoryBySlug(params.slug)
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
