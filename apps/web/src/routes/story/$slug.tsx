import { createFileRoute } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { getStoryBySlug } from '@/features/stories/api'
import { StoryDetails } from '@/features/stories/components/story-details'

export const Route = createFileRoute('/story/$slug')({
  loader: async ({ params }) => {
    return getStoryBySlug(params.slug)
  },
  head: function ({ loaderData, params }) {
    return {
      meta: [
        {
          title: loaderData
            ? `${loaderData.altTitle} | ${STORY_LEVELS.find((l) => l.value === loaderData.level)?.label ?? ''} | Real Spanish Stories`
            : 'Real Spanish Stories',
        },
        ...(loaderData?.description
          ? [{ name: 'description', content: loaderData.description }]
          : []),
      ],
      links: [
        {
          rel: 'canonical',
          href: `https://realspanishstories.com/story/${params.slug}`,
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
