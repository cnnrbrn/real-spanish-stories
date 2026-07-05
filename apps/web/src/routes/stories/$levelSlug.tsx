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
import {
  PageContainer,
  pageDescriptionClass,
  pageHeaderCenteredClass,
  pageTitleClass,
} from '@/components/ui/page'

const levelMeta: Record<
  StoryLevel,
  { title: string; h1: string; description: string; intro: string }
> = {
  'absolute-beginner': {
    title: 'Easy Spanish Listening for Absolute Beginners (Audio)',
    h1: 'Easy Spanish Listening for Absolute Beginners',
    description:
      'Easy Spanish listening for absolute beginners: very short audio stories, clearly narrated in Argentine Spanish, with full transcripts and English translations.',
    intro:
      'Short, slow audio stories from real Latin American history make Spanish listening easy for absolute beginners, right from day one. Each comes with an interactive transcript in clear Argentine (rioplatense) Spanish, so you can tap any word to see its English translation.',
  },
  beginner: {
    title: 'Beginner Spanish Listening Practice - Audio Stories',
    h1: 'Beginner Spanish Listening Practice',
    description:
      'Beginner Spanish listening practice: audio stories from Latin American history, narrated in clear Argentine Spanish, with full transcripts and English translations.',
    intro:
      'Practise Spanish listening as a beginner with real stories from Latin American history, narrated in clear Argentine (rioplatense) Spanish. Each story has an interactive transcript, so you can tap any word for its English translation and follow every line with confidence.',
  },
  intermediate: {
    title: 'Intermediate Spanish Listening Practice - Audio Stories',
    h1: 'Intermediate Spanish Listening Practice',
    description:
      'Intermediate Spanish listening practice: natural-paced audio stories from Latin American history in clear Argentine Spanish, with transcripts and translations.',
    intro:
      'True stories from Latin American history give intermediate learners Spanish listening practice, narrated in clear Argentine (rioplatense) Spanish. Open the interactive transcript and tap any word or phrase to see its English translation.',
  },
  advanced: {
    title: 'Advanced Spanish Listening Practice - Audio Stories',
    h1: 'Advanced Spanish Listening Practice',
    description:
      'Advanced Spanish listening practice: rich audio stories from Latin American history, narrated in clear Argentine Spanish, with full transcripts and English translations.',
    intro:
      'Rich, real stories from Latin American history give advanced learners Spanish listening practice in natural, connected speech, narrated in clear Argentine (rioplatense) Spanish. Tap any word or phrase in the interactive transcript, including subjunctive forms, to see its English translation.',
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
            ? levelMeta[loaderData.levelData.value].title
            : 'Real Spanish Stories',
        },
        ...(description ? [{ name: 'description', content: description }] : []),
        ...(loaderData
          ? [
              { property: 'og:type', content: 'website' },
              {
                property: 'og:title',
                content: levelMeta[loaderData.levelData.value].title,
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
    <PageContainer width="wide">
      <div className={pageHeaderCenteredClass}>
        <h1 className={pageTitleClass}>{levelMeta[levelData.value].h1}</h1>
        <p className={pageDescriptionClass}>
          {levelMeta[levelData.value].intro}
        </p>
      </div>
      <LevelLinks activeLevel={levelData.value} />
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
    </PageContainer>
  )
}
