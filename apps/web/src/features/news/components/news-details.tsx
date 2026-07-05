import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import { translateNewsPhrase } from '../api'
import { formatNewsDate } from '../utils/date'
import { newsHeading } from '../utils/title'
import type { NewsDetail, TranslationResponse } from '@real-spanish-stories/shared'
import { PageContainer, pageTitleClass } from '@/components/ui/page'
import { VideoPlayer } from '@/features/stories/components/video-player'
import { WordExplanationPanel } from '@/features/stories/components/word-explanation-panel'

interface NewsDetailsProps {
  news: NewsDetail
}

const WORD_CHAR = /[\p{L}\p{M}\p{N}'-]/u

// Resolve the single word under a pointer without tokenising the transcript.
function wordAtPoint(
  x: number,
  y: number,
): { text: string; node: Node; start: number; end: number } | null {
  let node: Node | null = null
  let offset = 0

  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }

  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y)
    if (pos) {
      node = pos.offsetNode
      offset = pos.offset
    }
  } else if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y)
    if (range) {
      node = range.startContainer
      offset = range.startOffset
    }
  }

  if (!node || node.nodeType !== Node.TEXT_NODE) return null
  const data = node.textContent ?? ''
  if (data.length === 0) return null

  let start = Math.min(offset, data.length - 1)
  // A caret sitting just after a word lands on the following character.
  if (start > 0 && !WORD_CHAR.test(data[start])) start -= 1
  if (!WORD_CHAR.test(data[start])) return null

  let end = start
  while (start > 0 && WORD_CHAR.test(data[start - 1])) start--
  while (end < data.length - 1 && WORD_CHAR.test(data[end + 1])) end++

  const text = data.slice(start, end + 1)
  return text ? { text, node, start, end } : null
}

export function NewsDetails({ news }: NewsDetailsProps) {
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [wordData, setWordData] = useState<TranslationResponse | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const formattedDate = formatNewsDate(news.date)

  useEffect(() => {
    const isMobile = !window.matchMedia('(min-width: 768px)').matches
    if (sidebarOpen && isMobile) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  async function runTranslate(phrase: string) {
    setSelectedPhrase(phrase)
    setWordData(null)
    setSidebarOpen(true)
    setIsLoadingWord(true)
    try {
      const data = await translateNewsPhrase(phrase, news.id)
      setWordData(data)
    } catch {
      setWordData({
        translation: '—',
        explanation: ['Translation unavailable.'],
      })
    } finally {
      setIsLoadingWord(false)
    }
  }

  // Single click translates one word; a drag translates the native selection.
  function handleSelect(clientX: number, clientY: number) {
    const selection = window.getSelection()
    const selected = selection?.toString().trim() ?? ''

    if (selected && selection && !selection.isCollapsed) {
      if (!transcriptRef.current?.contains(selection.anchorNode)) return
      runTranslate(selected)
      return
    }

    const word = wordAtPoint(clientX, clientY)
    if (!word) return
    if (!transcriptRef.current?.contains(word.node)) return

    // Highlight the clicked word for feedback.
    if (selection) {
      const range = document.createRange()
      range.setStart(word.node, word.start)
      range.setEnd(word.node, word.end + 1)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    runTranslate(word.text)
  }

  return (
    <PageContainer width="wide">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to="/easy-spanish-news"
          className="hover:text-primary transition-colors"
        >
          Easy Spanish News
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{news.title ?? formattedDate}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className={pageTitleClass}>{newsHeading(news)}</h1>
              {news.title && (
                <p className="mt-3 text-lg text-muted-foreground">
                  {formattedDate}
                </p>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors text-foreground md:hidden"
              aria-label="Toggle translation panel"
            >
              {sidebarOpen ? (
                <PanelRightClose className="w-6 h-6" />
              ) : (
                <PanelRightOpen className="w-6 h-6" />
              )}
            </button>
          </div>

          {news.videoLink && (
            <div className="mb-6 aspect-video bg-black">
              <VideoPlayer videoUrl={news.videoLink} />
            </div>
          )}

          {news.transcript && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Transcript
              </h2>
              <p className="text-lg text-muted-foreground mb-3">
                Select a Spanish word or phrase for a translation.
              </p>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-card">
                <div
                  ref={transcriptRef}
                  onMouseUp={(e) => handleSelect(e.clientX, e.clientY)}
                  onTouchEnd={(e) => {
                    const touch = e.changedTouches[0]
                    if (touch) handleSelect(touch.clientX, touch.clientY)
                  }}
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: news.transcript }}
                />
              </div>
            </>
          )}
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={[
            'fixed top-0 right-0 h-dvh z-50 w-[85vw] shrink-0 overflow-y-auto bg-[#fafafa] dark:bg-card',
            'transition-transform duration-300 ease-in-out',
            'md:sticky md:top-4 md:self-start md:h-auto md:w-80 md:translate-x-0 md:transition-none md:overflow-visible md:bg-transparent dark:md:bg-transparent',
            sidebarOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex justify-end p-2 md:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Close translation panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pb-4 md:p-0">
            <div className="md:rounded-lg md:border md:border-gray-200 dark:md:border-gray-700 p-4 md:bg-[#fafafa] md:dark:bg-card md:sticky md:top-4">
              {selectedPhrase || isLoadingWord ? (
                <WordExplanationPanel
                  phrase={selectedPhrase}
                  translation={wordData?.translation ?? null}
                  explanation={wordData?.explanation ?? null}
                  isLoading={isLoadingWord}
                />
              ) : (
                <p className="text-base text-muted-foreground">
                  Select a Spanish word or phrase in the transcript to see its
                  translation and explanation here.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
