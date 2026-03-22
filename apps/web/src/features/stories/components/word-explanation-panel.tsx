import type { ReactNode } from 'react'

function formatExplanation(text: string): ReactNode {
  const parts = text.split(/(\'[^']+\')/)
  return parts.map((part, i) =>
    part.startsWith("'") && part.endsWith("'")
      ? <strong key={i}>{part.slice(1, -1)}</strong>
      : part
  )
}

interface WordExplanationPanelProps {
  phrase: string | null
  translation: string | null
  explanation: string[] | null
  isLoading: boolean
  englishOnly?: boolean
}

export function WordExplanationPanel({
  phrase,
  translation,
  explanation,
  isLoading,
  englishOnly,
}: WordExplanationPanelProps) {
  if (!phrase && !isLoading) {
    return (
      <div className="text-base font-bold text-gray-700 dark:text-gray-300">
        Select a Spanish word or phrase from the transcript below the video for a translation.
      </div>
    )
  }

  if (englishOnly) {
    return (
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{phrase}</p>
        <p className="text-base text-gray-700 dark:text-gray-300">
          Select a Spanish word or phrase to translate.
        </p>
      </div>
    )
  }

  return (
    <div>
      {phrase && (
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{phrase}</p>
      )}
      {isLoading ? (
        <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
          <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Translating…
        </div>
      ) : (
        <>
          {translation && (
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-3 font-medium">
              {translation}
            </p>
          )}
          {explanation && explanation.map((part, i) => (
            <p key={i} className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-3 last:mb-0">
              {formatExplanation(part)}
            </p>
          ))}
        </>
      )}
    </div>
  )
}
