import { createContext, useCallback, useContext, useMemo } from 'react'
import parse, { Text } from 'html-react-parser'
import type {
  WordSelectionHandlers,
  WordSelectionRange,
} from '@/features/translate/use-word-selection'
import { useWordSelection } from '@/features/translate/use-word-selection'

interface SelectableTranscriptProps {
  html: string
  onPhraseSelect: (phrase: string) => void
}

interface WordContextValue {
  selectedIndices: Set<number>
  getWordProps: (index: number) => WordSelectionHandlers
  pulseIndex: number | null
}

// Selection state reaches each word through context so that highlighting a
// selection re-renders only the word spans, without re-parsing the HTML.
const WordContext = createContext<WordContextValue | null>(null)

const WHITESPACE = /^\s+$/

function SelectableWord({ index, text }: { index: number; text: string }) {
  const ctx = useContext(WordContext)
  if (!ctx) return text
  const isSelected = ctx.selectedIndices.has(index)
  const isPulsing = ctx.pulseIndex === index
  return (
    <span
      data-word-index={index}
      className={[
        'py-1 box-decoration-clone transition-transform duration-150 ease-out',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'cursor-pointer transition-colors hover:bg-primary/10',
        isPulsing ? 'scale-110' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...ctx.getWordProps(index)}
    >
      {text}
    </span>
  )
}

// The whitespace between two words. It belongs to the selection when the words
// on both sides are selected — which, since a selection is always a contiguous
// range, means this gap sits inside that range.
function SelectableSpace({
  leftIndex,
  text,
}: {
  leftIndex: number
  text: string
}) {
  const ctx = useContext(WordContext)
  if (!ctx) return text
  const isSelected =
    ctx.selectedIndices.has(leftIndex) && ctx.selectedIndices.has(leftIndex + 1)
  return (
    <span
      className={
        isSelected ? 'bg-primary text-primary-foreground py-1' : undefined
      }
    >
      {text}
    </span>
  )
}

export function SelectableTranscript({
  html,
  onPhraseSelect,
}: SelectableTranscriptProps) {
  // Tokenise once per html: wrap each word in a SelectableWord addressed by a
  // running global index and collect the words, so a committed index range maps
  // back to a phrase. Element nodes fall through to the default conversion, so
  // the TipTap rich-text structure (headings, lists, bold, links) is preserved.
  const { content, words } = useMemo(() => {
    const collected: string[] = []
    let index = 0
    const parsed = parse(html, {
      replace: (domNode) => {
        if (!(domNode instanceof Text)) return undefined
        const parts = domNode.data.split(/(\s+)/)
        return (
          <>
            {parts.map((part, i) => {
              if (part === '') return null
              if (WHITESPACE.test(part)) {
                return (
                  <SelectableSpace
                    key={`space-${index}-${i}`}
                    leftIndex={index - 1}
                    text={part}
                  />
                )
              }
              const wordIndex = index
              index += 1
              collected.push(part)
              return (
                <SelectableWord
                  key={`${wordIndex}:${i}`}
                  index={wordIndex}
                  text={part}
                />
              )
            })}
          </>
        )
      },
    })
    return { content: parsed, words: collected }
  }, [html])

  const handleSelect = useCallback(
    ({ loIndex, hiIndex }: WordSelectionRange) => {
      const phrase = words
        .slice(loIndex, hiIndex + 1)
        .join(' ')
        .trim()
      if (phrase) onPhraseSelect(phrase)
    },
    [words, onPhraseSelect],
  )

  const { getWordProps, selectedIndices, containerProps, pulseIndex } =
    useWordSelection({ onSelect: handleSelect })

  const contextValue = useMemo(
    () => ({ selectedIndices, getWordProps, pulseIndex }),
    [selectedIndices, getWordProps, pulseIndex],
  )

  return (
    <div
      {...containerProps}
      className="prose prose-lg dark:prose-invert max-w-none select-none touch-pan-y [-webkit-touch-callout:none]"
    >
      <WordContext.Provider value={contextValue}>
        {content}
      </WordContext.Provider>
    </div>
  )
}
