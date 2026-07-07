import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import { translateNewsPhrase } from '../api'
import { formatNewsDate } from '../utils/date'
import { newsHeading } from '../utils/title'
import { NewsDownloads } from './news-downloads'
import { SelectableTranscript } from './selectable-transcript'
import type { NewsDetail, TranslationResponse } from '@real-spanish-stories/shared'
import { PageContainer, pageTitleClass } from '@/components/ui/page'
import { VideoPlayer } from '@/features/stories/components/video-player'
import { WordExplanationPanel } from '@/features/stories/components/word-explanation-panel'

interface NewsDetailsProps {
  news: NewsDetail
}

export function NewsDetails({ news }: NewsDetailsProps) {
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

  const runTranslate = useCallback(
    async (phrase: string) => {
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
    },
    [news.id],
  )

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

          {news.summary && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Summary
              </h2>
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: news.summary }}
              />
            </div>
          )}

          {news.transcript && (
            <>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Transcript
                </h2>
                <NewsDownloads news={news} />
              </div>
              <p className="text-lg text-muted-foreground mb-3">
                Select a Spanish word or phrase for a translation.
              </p>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-card">
                <SelectableTranscript
                  html={news.transcript}
                  onPhraseSelect={runTranslate}
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
