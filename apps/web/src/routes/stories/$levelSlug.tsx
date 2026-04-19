import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'

const levelMeta: Record<StoryLevel, { description: string }> = {
  'just-starting': {
    description:
      'Spanish stories for complete beginners. Very short sentences, small vocabulary, and just 3 unique verbs - the perfect starting point.',
  },
  beginner: {
    description:
      'Beginner Spanish stories with simple, common vocabulary and straightforward grammar. Build confidence with 6 unique verbs per story.',
  },
  intermediate: {
    description:
      'Intermediate Spanish stories with broader vocabulary and varied grammar structures. Challenge yourself with 10+ unique verbs per story.',
  },
  advanced: {
    description:
      'Advanced Spanish stories with rich vocabulary and complex structures including the subjunctive. 15+ unique verbs per story.',
  },
}

export const Route = createFileRoute('/stories/$levelSlug')({
  loader: async ({ params }) => {
    const levelData = STORY_LEVELS.find((l) => l.urlSlug === params.levelSlug)
    if (!levelData) throw notFound()
    const stories = await getStories([levelData.value])
    return { levelData, stories }
  },
  head: ({ loaderData, params }) => {
    const description = loaderData
      ? levelMeta[loaderData.levelData.value].description
      : undefined
    return {
      meta: [
        {
          title: loaderData
            ? `${loaderData.levelData.label} Spanish Stories | Real Spanish Stories`
            : 'Real Spanish Stories',
        },
        ...(description ? [{ name: 'description', content: description }] : []),
      ],
      links: [
        {
          rel: 'canonical',
          href: `https://realspanishstories.com/stories/${params.levelSlug}`,
        },
      ],
    }
  },
  component: LevelStoriesPage,
})

function LevelStoriesPage() {
  const { levelData, stories } = Route.useLoaderData()

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          {levelData.label} Spanish Stories
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {levelMeta[levelData.value].description}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-base">
          {STORY_LEVELS.map((l) => {
            const isActive = l.value === levelData.value
            return isActive ? (
              <span
                key={l.value}
                className="font-semibold text-gray-900 dark:text-gray-100"
              >
                {l.label}
              </span>
            ) : (
              <Link
                key={l.value}
                to="/stories/$levelSlug"
                params={{ levelSlug: l.urlSlug }}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      </div>
      <StoryList stories={stories} />
    </div>
  )
}
