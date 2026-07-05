import { Link, createFileRoute } from '@tanstack/react-router'
import {
  PageContainer,
  pageDescriptionClass,
  pageTitleClass,
} from '@/components/ui/page'

export const Route = createFileRoute('/how-it-works')({
  head: () => ({
    meta: [
      {
        title: 'How It Works | Real Spanish Stories',
      },
      {
        name: 'description',
        content:
          'Find out how Real Spanish Stories works. Each story is graded across four levels, comes with real-voice audio, a PDF script, and word-by-word translation so you can learn Spanish at your own pace.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'How It Works | Real Spanish Stories' },
      {
        property: 'og:description',
        content:
          'Find out how Real Spanish Stories works. Each story is graded across four levels, comes with real-voice audio, a PDF script, and word-by-word translation so you can learn Spanish at your own pace.',
      },
      {
        property: 'og:image',
        content: 'https://realspanishstories.com/og-image.jpg',
      },
      { property: 'og:url', content: 'https://realspanishstories.com/how-it-works' },
    ],
    links: [
      { rel: 'canonical', href: 'https://realspanishstories.com/how-it-works' },
    ],
  }),
  component: HowItWorksPage,
})

function HowItWorksPage() {
  return (
    <PageContainer width="prose">
      <h1 className={pageTitleClass}>
        Learn Spanish with Real Latin American History
      </h1>
      <p className={pageDescriptionClass}>
        Beginner and intermediate Spanish content can be a little dull. Real
        Spanish Stories uses comprehensible input with graded, easy-to-follow
        language applied to real Latin American history. Each story is
        narrated by a real human, we don't use AI voices.
      </p>
      <p className={pageDescriptionClass}>
        Each story is available at four levels. Pick the one that matches
        where you are.
      </p>

      <div className="space-y-8 mb-12">
        {[
          {
            label: 'Absolute Beginner',
            verbs: '3 unique verbs per story',
            description:
              'Very short sentences and a tiny vocabulary. Ideal if you know little or no Spanish.',
          },
          {
            label: 'Beginner',
            verbs: '6 unique verbs per story',
            description:
              'Simple, common vocabulary with straightforward sentence structures.',
          },
          {
            label: 'Intermediate',
            verbs: '10 unique verbs per story',
            description:
              'A broader vocabulary and more varied grammar — a solid challenge for learners who have the basics.',
          },
          {
            label: 'Advanced',
            verbs: '15+ verbs per story, including 2 - 3 subjunctive forms',
            description:
              'Rich vocabulary, complex structures, and idiomatic Spanish close to native-level reading.',
          },
        ].map((level) => (
          <div key={level.label}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {level.label}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
              {level.description}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {level.verbs}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Browse Stories
      </Link>
    </PageContainer>
  )
}
