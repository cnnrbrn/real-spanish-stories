import { useRef, useState } from 'react'
import type {
  Transcription,
  TranscriptionSection,
  TranscriptionWord,
} from '@real-spanish-stories/shared'

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
  onPhraseSelect?: (selection: PhraseSelection) => void
  selectedIndices?: Set<number>
  selectionStartRef: React.MutableRefObject<number | null>
  selectionEndRef: React.MutableRefObject<number | null>
  isDragging: React.MutableRefObject<boolean>
  allWords: TranscriptionWord[]
  onDragUpdate: (endIndex: number) => void
}

function TranscriptSectionComponent({
  section,
  currentTime,
  wordOffset,
  onPhraseSelect,
  selectedIndices,
  selectionStartRef,
  selectionEndRef,
  isDragging,
  allWords,
  onDragUpdate,
}: TranscriptSectionProps) {
  if (section.static) {
    return (
      <p className="text-lg font-semibold text-primary uppercase tracking-wide mt-6 mb-2">
        {section.text}
      </p>
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
            const isSelected = selectedIndices?.has(globalIndex) ?? false
            const isSpanish = entry.word.language !== 'en'

            return (
              <span
                key={entry.sectionIdx}
                className={isSelected ? 'bg-primary text-primary-foreground' : ''}
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
                  onMouseDown={(e) => {
                    e.preventDefault()
                    isDragging.current = true
                    selectionStartRef.current = globalIndex
                    selectionEndRef.current = globalIndex
                    onDragUpdate(globalIndex)
                  }}
                  onMouseEnter={() => {
                    if (isDragging.current) onDragUpdate(globalIndex)
                  }}
                  onMouseUp={() => {
                    if (!isDragging.current) return
                    isDragging.current = false
                    const start = selectionStartRef.current
                    const end = selectionEndRef.current
                    if (start === null || end === null) return
                    const lo = Math.min(start, end)
                    const hi = Math.max(start, end)
                    const selectedWords = allWords.slice(lo, hi + 1)
                    onPhraseSelect?.({
                      words: selectedWords,
                      phrase: selectedWords.map((w) => w.word).join(' '),
                    })
                  }}
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
      const isSelected = selectedIndices?.has(globalIndex) ?? false
      const isSpanish = entry.word.language !== 'en'

      return (
        <span
          key={entry.sectionIdx}
          className={isSelected ? 'bg-primary text-primary-foreground' : ''}
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
            onMouseDown={(e) => {
              e.preventDefault()
              isDragging.current = true
              selectionStartRef.current = globalIndex
              selectionEndRef.current = globalIndex
              onDragUpdate(globalIndex)
            }}
            onMouseEnter={() => {
              if (isDragging.current) onDragUpdate(globalIndex)
            }}
            onMouseUp={() => {
              if (!isDragging.current) return
              isDragging.current = false
              const start = selectionStartRef.current
              const end = selectionEndRef.current
              if (start === null || end === null) return
              const lo = Math.min(start, end)
              const hi = Math.max(start, end)
              const selectedWords = allWords.slice(lo, hi + 1)
              onPhraseSelect?.({
                words: selectedWords,
                phrase: selectedWords.map((w) => w.word).join(' '),
              })
            }}
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

  return (
    <div className="mb-4">
      <p
        className={`leading-relaxed select-none ${isTitle ? 'text-2xl font-bold text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-gray-100'}`}
      >
        {section.words.map((word, i: number) => {
          const globalIndex = wordOffset + i
          const isActive = currentTime >= word.start && currentTime < word.end
          const isSelected = selectedIndices?.has(globalIndex) ?? false

          return (
            <span
              key={i}
              className={isSelected ? 'bg-primary text-primary-foreground' : ''}
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
                onMouseDown={(e) => {
                  e.preventDefault()
                  isDragging.current = true
                  selectionStartRef.current = globalIndex
                  selectionEndRef.current = globalIndex
                  onDragUpdate(globalIndex)
                }}
                onMouseEnter={() => {
                  if (isDragging.current) {
                    onDragUpdate(globalIndex)
                  }
                }}
                onMouseUp={() => {
                  if (!isDragging.current) return
                  isDragging.current = false
                  const start = selectionStartRef.current
                  const end = selectionEndRef.current
                  if (start === null || end === null) return
                  const lo = Math.min(start, end)
                  const hi = Math.max(start, end)
                  const selectedWords = allWords.slice(lo, hi + 1)
                  onPhraseSelect?.({
                    words: selectedWords,
                    phrase: selectedWords.map((w) => w.word).join(' '),
                  })
                }}
              >
                {word.word}
              </span>
              {word.lineBreak ? <br /> : ' '}
            </span>
          )
        })}
      </p>
    </div>
  )
}

export function TranscriptDisplay({
  transcription,
  currentTime,
  onPhraseSelect,
  selectedIndices,
}: TranscriptDisplayProps) {
  const selectionStartRef = useRef<number | null>(null)
  const selectionEndRef = useRef<number | null>(null)
  const isDragging = useRef(false)
  const [, forceUpdate] = useState(0)

  // Flat list of all words with their global indices, for slice operations
  const allWords = transcription.sections.flatMap((s) => s.words)

  // Compute word offsets per section
  const sectionOffsets: number[] = []
  let offset = 0
  for (const section of transcription.sections) {
    sectionOffsets.push(offset)
    offset += section.words.length
  }

  function handleDragUpdate(endIndex: number) {
    selectionEndRef.current = endIndex
    forceUpdate((n) => n + 1)
  }

  // Build selected set from current drag state for live feedback
  const liveSelectedIndices = (() => {
    if (!isDragging.current) return selectedIndices
    const start = selectionStartRef.current
    const end = selectionEndRef.current
    if (start === null || end === null) return selectedIndices
    const lo = Math.min(start, end)
    const hi = Math.max(start, end)
    const set = new Set<number>()
    for (let i = lo; i <= hi; i++) set.add(i)
    return set
  })()

  return (
    <div
      className="mt-6 text-xl"
      onMouseLeave={() => {
        if (isDragging.current) {
          isDragging.current = false
        }
      }}
    >
      {transcription.sections.map((section, i) => (
        <TranscriptSectionComponent
          key={i}
          section={section}
          currentTime={currentTime}
          wordOffset={sectionOffsets[i]}
          onPhraseSelect={onPhraseSelect}
          selectedIndices={liveSelectedIndices}
          selectionStartRef={selectionStartRef}
          selectionEndRef={selectionEndRef}
          isDragging={isDragging}
          allWords={allWords}
          onDragUpdate={handleDragUpdate}
        />
      ))}
    </div>
  )
}
