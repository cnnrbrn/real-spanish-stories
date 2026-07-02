import { createFileRoute, notFound } from '@tanstack/react-router'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type { StoryLevel } from '@real-spanish-stories/shared'
import { getStories } from '@/features/stories/api'
import { StoryList } from '@/features/stories/components/story-list'
import { StoryRowList } from '@/features/stories/components/story-row-list'
import { StoryViewToggle } from '@/features/stories/components/story-view-toggle'
import { SkipToStorySwitch } from '@/features/stories/components/skip-to-story-switch'
import { StoryAutoplaySwitch } from '@/features/stories/components/story-autoplay-switch'
import { LevelLinks } from '@/features/stories/components/level-links'
import { usePreferencesStore } from '@/stores/preferences'

const levelMeta: Record<StoryLevel, { description: string; intro: string }> = {
  'absolute-beginner': {
    description:
      'Absolute beginner Spanish stories with very short sentences and a tiny vocabulary — the perfect starting point, with full transcripts and English translations.',
    intro:
      'These stories are for absolute beginners just starting out in Spanish — the simplest level, with full transcripts and English translations for every word. Narrated in clear Argentine (rioplatense) Spanish.',
  },
  beginner: {
    description:
      'Beginner Spanish stories with simple, common vocabulary and straightforward grammar. Build confidence with transcripts, translations, and 6 unique verbs per story.',
    intro:
      'Beginner Spanish stories built for learners with the basics down — simple vocabulary and straightforward grammar, narrated in clear Argentine (rioplatense) Spanish with full transcripts and translations.',
  },
  intermediate: {
    description:
      'Intermediate Spanish stories with broader vocabulary and varied grammar structures. Challenge yourself with 10+ unique verbs per story, transcripts, and translations.',
    intro:
      'Intermediate Spanish stories for learners ready to stretch beyond the basics — broader vocabulary and varied grammar, narrated in clear Argentine (rioplatense) Spanish.',
  },
  advanced: {
    description:
      'Advanced Spanish stories with rich vocabulary and complex structures including the subjunctive. 15+ unique verbs per story, with full transcripts and translations.',
    intro:
      'Advanced Spanish stories with rich vocabulary and complex grammar, including the subjunctive — narrated in clear Argentine (rioplatense) Spanish for learners aiming for near-native fluency.',
  },
}

const H1_SUFFIX: Record<StoryLevel, string> = {
  'absolute-beginner': 'Easy Stories to Start With',
  beginner: 'Stories to Build Confidence',
  intermediate: 'Stories to Stretch Your Spanish',
  advanced: 'Stories for Near-Native Fluency',
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
        ...(loaderData
          ? [
              { property: 'og:type', content: 'website' },
              {
                property: 'og:title',
                content: `${loaderData.levelData.label} Spanish Stories | Real Spanish Stories`,
              },
              ...(description
                ? [{ property: 'og:description', content: description }]
                : []),
              {
                property: 'og:url',
                content: `https://realspanishstories.com/stories/${params.levelSlug}`,
              },
              {
                property: 'og:image',
                content: 'https://realspanishstories.com/og-image.jpg',
              },
            ]
          : []),
      ],
      links: [
        {
          rel: 'canonical',
          href: `https://realspanishstories.com/stories/${params.levelSlug}`,
        },
      ],
      scripts: loaderData
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://realspanishstories.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: `${loaderData.levelData.label} Spanish Stories`,
                    item: `https://realspanishstories.com/stories/${params.levelSlug}`,
                  },
                ],
              }),
            },
          ]
        : [],
    }
  },
  component: LevelStoriesPage,
})

function LevelStoriesPage() {
  const { levelData, stories } = Route.useLoaderData()
  const levelViewMode = usePreferencesStore((s) => s.levelViewMode)

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6 md:mb-3">
          {levelData.label} Spanish — {H1_SUFFIX[levelData.value]}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {levelMeta[levelData.value].intro}
        </p>
        <LevelLinks activeLevel={levelData.value} />
      </div>
      <div className="flex justify-end items-center gap-4 mb-4">
        {levelViewMode === 'row' && (
          <>
            <SkipToStorySwitch />
            <StoryAutoplaySwitch />
          </>
        )}
        <StoryViewToggle />
      </div>
      {levelViewMode === 'row' ? (
        <StoryRowList stories={stories} />
      ) : (
        <StoryList stories={stories} />
      )}
    </div>
  )
}
