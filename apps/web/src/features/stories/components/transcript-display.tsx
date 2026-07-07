import { useCallback, useMemo } from 'react'
import type {
  WordSelectionHandlers,
  WordSelectionRange,
} from '@/features/translate/use-word-selection'
import type {
  Transcription,
  TranscriptionSection,
  TranscriptionWord,
} from '@real-spanish-stories/shared'
import { useWordSelection } from '@/features/translate/use-word-selection'

interface PhraseSelection {
  words: TranscriptionWord[]
  phrase: string
}

interface TranscriptDisplayProps {
  transcription: Transcription
  currentTime: number
  onPhraseSelect?: (selection: PhraseSelection) => void
  selectedIndices?: Set<number>
}

interface TranscriptSectionProps {
  section: TranscriptionSection
  currentTime: number
  wordOffset: number
  selectedIndices: Set<number>
  getWordProps: (globalIndex: number) => WordSelectionHandlers
  pulseIndex: number | null
}

function TranscriptSectionComponent({
  section,
  currentTime,
  wordOffset,
  selectedIndices,
  getWordProps,
  pulseIndex,
}: TranscriptSectionProps) {
  if (section.static) {
    return (
      <h3 className="text-lg font-semibold text-primary uppercase tracking-wide mt-6 mb-2">
        {section.text}
      </h3>
    )
  }

  // TODO(seo): vocabulary/verbs/subjunctive_verbs sections are only rendered
  // when present in transcription.sections — a story missing them has less
  // unique on-page text. No comprehension-questions feature exists yet;
  // adding one would help thin pages (see story-details.tsx TODO).
  if (section.type === 'vocabulary') {
    const lines: Array<Array<{ word: TranscriptionWord; sectionIdx: number }>> =
      []
    let current: Array<{ word: TranscriptionWord; sectionIdx: number }> = []
    section.words.forEach((word, sectionIdx) => {
      current.push({ word, sectionIdx })
      if (word.lineBreak) {
        lines.push(current)
        current = []
      }
    })
    if (current.length > 0) lines.push(current)

    const stripComma = (text: string) => text.replace(/,+$/, '')

    return (
      <div className="mb-4">
        {lines.map((line, lineIdx) => {
          const spanishEntries = line.filter((e) => e.word.language !== 'en')
          const englishEntries = line.filter((e) => e.word.language === 'en')

          const renderWord = (
            entry: { word: TranscriptionWord; sectionIdx: number },
            i: number,
            arr: typeof spanishEntries,
          ) => {
            const globalIndex = wordOffset + entry.sectionIdx
            const isActive =
              currentTime >= entry.word.start && currentTime < entry.word.end
            const isSelected = selectedIndices.has(globalIndex)
            const isPulsing = pulseIndex === globalIndex
            const isSpanish = entry.word.language !== 'en'

            return (
              <span
                key={entry.sectionIdx}
                data-word-index={globalIndex}
                className={[
                  isSelected ? 'bg-primary text-primary-foreground' : '',
                  'transition-transform duration-150 ease-out',
                  isPulsing ? 'scale-110' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                {...getWordProps(globalIndex)}
              >
                <span
                  className={[
                    'transition-colors',
                    isSpanish
                      ? 'cursor-pointer font-bold underline decoration-dotted underline-offset-2 decoration-gray-400 dark:decoration-gray-500 hover:text-primary hover:decoration-primary'
                      : 'cursor-default',
                    !isSelected && isActive ? 'text-red-500' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {stripComma(entry.word.word)}
                </span>
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            )
          }

          return (
            <p
              key={lineIdx}
              className="leading-relaxed select-none text-gray-900 dark:text-gray-100"
            >
              {spanishEntries.map((e, i) => renderWord(e, i, spanishEntries))}
              <span className="text-gray-500 dark:text-gray-400"> - </span>
              {englishEntries.map((e, i) => renderWord(e, i, englishEntries))}
            </p>
          )
        })}
      </div>
    )
  }

  if (section.type === 'verbs') {
    const groups: Array<Array<{ word: TranscriptionWord; sectionIdx: number }>> =
      []
    let currentGroup: Array<{ word: TranscriptionWord; sectionIdx: number }> =
      []
    section.words.forEach((word, sectionIdx) => {
      currentGroup.push({ word, sectionIdx })
      if (word.lineBreak) {
        groups.push(currentGroup)
        currentGroup = []
      }
    })
    if (currentGroup.length > 0) groups.push(currentGroup)

    const getRuns = (
      entries: Array<{ word: TranscriptionWord; sectionIdx: number }>,
    ) => {
      const runs: Array<{
        language: string
        entries: Array<{ word: TranscriptionWord; sectionIdx: number }>
      }> = []
      for (const entry of entries) {
        const lang = entry.word.language
        if (runs.length === 0 || runs[runs.length - 1].language !== lang) {
          runs.push({ language: lang, entries: [entry] })
        } else {
          runs[runs.length - 1].entries.push(entry)
        }
      }
      return runs
    }

    const renderVerbWord = (
      entry: { word: TranscriptionWord; sectionIdx: number },
      i: number,
      arr: Array<{ word: TranscriptionWord; sectionIdx: number }>,
      bold: boolean,
    ) => {
      const globalIndex = wordOffset + entry.sectionIdx
      const isActive =
        currentTime >= entry.word.start && currentTime < entry.word.end
      const isSelected = selectedIndices.has(globalIndex)
      const isPulsing = pulseIndex === globalIndex
      const isSpanish = entry.word.language !== 'en'

      return (
        <span
          key={entry.sectionIdx}
          data-word-index={globalIndex}
          className={[
            isSelected ? 'bg-primary text-primary-foreground' : '',
            'transition-transform duration-150 ease-out',
            isPulsing ? 'scale-110' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...getWordProps(globalIndex)}
        >
          <span
            className={[
              'transition-colors',
              isSpanish
                ? [
                    'cursor-pointer',
                    bold ? 'font-bold' : '',
                    'underline decoration-dotted underline-offset-2 decoration-gray-400 dark:decoration-gray-500 hover:text-primary hover:decoration-primary',
                  ]
                    .filter(Boolean)
                    .join(' ')
                : 'cursor-default',
              !isSelected && isActive ? 'text-red-500' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {entry.word.word}
          </span>
          {i < arr.length - 1 ? ' ' : ''}
        </span>
      )
    }

    return (
      <div>
        {groups.map((group, groupIdx) => {
          const runs = getRuns(group)
          const verbRun = runs[0]
          const translationRun = runs[1]
          const esSentenceRun = runs[2]
          const enSentenceRun = runs[3]

          return (
            <div key={groupIdx} className="mb-4">
              {groupIdx > 0 && (
                <hr className="mb-4 border-gray-200 dark:border-gray-800" />
              )}
              <p className="leading-relaxed select-none text-gray-900 dark:text-gray-100">
                {verbRun.entries.map((e, i, arr) =>
                  renderVerbWord(e, i, arr, true),
                )}
                <span className="text-gray-500 dark:text-gray-400"> - </span>
                {translationRun.entries.map((e, i, arr) =>
                  renderVerbWord(e, i, arr, true),
                )}
              </p>
              <p className="mt-2 leading-relaxed select-none text-gray-900 dark:text-gray-100">
                {esSentenceRun.entries.map((e, i, arr) =>
                  renderVerbWord(e, i, arr, true),
                )}
                <span className="text-gray-500 dark:text-gray-400"> - </span>
                {enSentenceRun.entries.map((e, i, arr) =>
                  renderVerbWord(e, i, arr, false),
                )}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  const isTitle =
    section.type === 'title_spanish' || section.type === 'title_english'
  const TextTag = isTitle ? 'h3' : 'p'

  return (
    <div className="mb-4">
      <TextTag
        className={`leading-relaxed select-none ${isTitle ? 'text-2xl font-bold text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-gray-100'}`}
      >
        {section.words.map((word, i: number) => {
          const globalIndex = wordOffset + i
          const isActive = currentTime >= word.start && currentTime < word.end
          const isSelected = selectedIndices.has(globalIndex)
          const isPulsing = pulseIndex === globalIndex

          return (
            <span
              key={i}
              data-word-index={globalIndex}
              className={[
                isSelected ? 'bg-primary text-primary-foreground' : '',
                'transition-transform duration-150 ease-out',
                isPulsing ? 'scale-110' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              {...getWordProps(globalIndex)}
            >
              <span
                className={[
                  'transition-colors',
                  word.language !== 'en'
                    ? 'cursor-pointer underline decoration-dotted underline-offset-2 decoration-gray-400 dark:decoration-gray-500'
                    : 'cursor-default',
                  !isSelected && isActive ? 'text-red-500' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {word.word}
              </span>
              {word.lineBreak ? <br /> : ' '}
            </span>
          )
        })}
      </TextTag>
    </div>
  )
}

export function TranscriptDisplay({
  transcription,
  currentTime,
  onPhraseSelect,
  selectedIndices,
}: TranscriptDisplayProps) {
  // Flat list of all words with their global indices, for slice operations
  const allWords = useMemo(
    () => transcription.sections.flatMap((s) => s.words),
    [transcription],
  )

  // Word offset per section
  const sectionOffsets = useMemo(() => {
    const offsets: number[] = []
    let offset = 0
    for (const section of transcription.sections) {
      offsets.push(offset)
      offset += section.words.length
    }
    return offsets
  }, [transcription])

  const handleSelect = useCallback(
    ({ loIndex, hiIndex }: WordSelectionRange) => {
      const selectedWords = allWords.slice(loIndex, hiIndex + 1)
      if (selectedWords.length === 0) return
      onPhraseSelect?.({
        words: selectedWords,
        phrase: selectedWords.map((w) => w.word).join(' '),
      })
    },
    [allWords, onPhraseSelect],
  )

  const {
    getWordProps,
    selectedIndices: effectiveSelectedIndices,
    containerProps,
    pulseIndex,
  } = useWordSelection({ onSelect: handleSelect, selectedIndices })

  return (
    <div
      {...containerProps}
      className="mt-6 text-xl select-none touch-pan-y [-webkit-touch-callout:none]"
    >
      {transcription.sections.map((section, i) => (
        <TranscriptSectionComponent
          key={i}
          section={section}
          currentTime={currentTime}
          wordOffset={sectionOffsets[i]}
          selectedIndices={effectiveSelectedIndices}
          getWordProps={getWordProps}
          pulseIndex={pulseIndex}
        />
      ))}
    </div>
  )
}
