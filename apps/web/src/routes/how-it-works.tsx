import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/how-it-works')({
  head: () => ({
    meta: [
      {
        title: 'How It Works | Real Spanish Stories',
      },
      {
        name: 'description',
        content:
          'Learn Spanish through real Latin American history stories graded across four levels — from Just Starting to Advanced. Comprehensible input that is actually interesting.',
      },
    ],
  }),
  component: HowItWorksPage,
})

function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
        Learn Spanish with Real Latin American History
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Beginner and intermediate Spanish content can be a little dull. Real
        Spanish Stories uses comprehensible input — graded, easy-to-follow
        language — applied to real Latin American history, with native voice
        audio for every story.
      </p>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
        Each story is available at four levels. Pick the one that matches where
        you are.
      </p>

      <div className="space-y-8 mb-12">
        {[
          {
            label: 'Just Starting',
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
            verbs: '15+ verbs per story, including 2–3 subjunctive forms',
            description:
              'Rich vocabulary, complex structures, and idiomatic Spanish close to native-level reading.',
          },
        ].map((level) => (
          <div key={level.label}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {level.label}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">{level.description}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{level.verbs}</p>
          </div>
        ))}
      </div>

      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Browse Stories
      </Link>
    </div>
  )
}
