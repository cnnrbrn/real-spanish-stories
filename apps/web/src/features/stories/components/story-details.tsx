import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PanelRightClose, PanelRightOpen, X, Download } from 'lucide-react'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import type {
  Story,
  StoryDetail,
  TranscriptionWord,
  TranslationResponse,
} from '@real-spanish-stories/shared'
import { translatePhrase } from '../api'
import { createStoryTitle } from '../utils/story'
import { VideoPlayer } from './video-player'
import { LevelBadge } from './level-badge'
import { TranscriptDisplay } from './transcript-display'
import { WordExplanationPanel } from './word-explanation-panel'
import type { VideoPlayerHandle } from './video-player'
import { usePreferencesStore } from '@/stores/preferences'

interface StoryDetailsProps {
  story: StoryDetail
}

export function StoryDetails({ story }: StoryDetailsProps) {
  const playerRef = useRef<VideoPlayerHandle>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [wordData, setWordData] = useState<{
    translation: string
    explanation: string[]
  } | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [englishOnly, setEnglishOnly] = useState(false)
  const { hintDismissed, dismissHint } = usePreferencesStore()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 768px)').matches
  })

  useEffect(() => {
    const isMobile = !window.matchMedia('(min-width: 768px)').matches
    if (sidebarOpen && isMobile) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  async function handlePhraseSelect({
    words,
    phrase,
  }: {
    words: TranscriptionWord[]
    phrase: string
  }) {
    if (words.length === 0) return
    setSidebarOpen(true)
    dismissHint()

    playerRef.current?.seekTo(words[0].start)
    setSelectedPhrase(phrase)
    setWordData(null)

    // Compute indices: find the global index range for these words
    let globalOffset = 0
    const indices = new Set<number>()
    for (const section of story.transcription.sections) {
      for (let i = 0; i < section.words.length; i++) {
        const w = section.words[i]
        if (words.includes(w)) {
          indices.add(globalOffset + i)
        }
      }
      globalOffset += section.words.length
    }
    setSelectedIndices(indices)

    if (words.every((w) => w.language === 'en')) {
      setEnglishOnly(true)
      return
    }
    setEnglishOnly(false)
    setIsLoadingWord(true)

    try {
      const data: TranslationResponse = await translatePhrase(phrase, story.id)
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

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div
        className={`flex-1 min-w-0${!sidebarOpen ? ' max-w-5xl mx-auto' : ''}`}
      >
        {(() => {
          const level = STORY_LEVELS.find((l) => l.value === story.level)
          return (
            <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              {level && (
                <>
                  <span>/</span>
                  <Link
                    to="/stories/$levelSlug"
                    params={{ levelSlug: level.urlSlug }}
                    className="hover:text-foreground transition-colors"
                  >
                    {level.label} Spanish Stories
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-foreground">{story.altTitle || story.title}</span>
            </nav>
          )
        })()}
        {story.videoLink && (
          <div className="mb-6 aspect-video bg-black">
            <VideoPlayer
              ref={playerRef}
              key={story.videoLink}
              videoUrl={story.videoLink}
              title={story.altTitle || story.title}
              onTimeUpdate={setCurrentTime}
            />
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {createStoryTitle(story)}
            </h1>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle translation panel"
            >
              {sidebarOpen ? (
                <PanelRightClose className="w-6 h-6" />
              ) : (
                <PanelRightOpen className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2">
            <div className="self-start">
              <LevelBadge level={story.level} size="lg" />
            </div>
            {(story.pdfLightPath || story.pdfDarkPath) && (
              <div className="flex items-center">
                {story.pdfLightPath && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}stories/${story.id}/pdf/light`}
                    download
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-base"
                  >
                    <Download className="w-4 h-4" />
                    PDF (Light)
                  </a>
                )}
                {story.pdfDarkPath && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}stories/${story.id}/pdf/dark`}
                    download
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-base"
                  >
                    <Download className="w-4 h-4" />
                    PDF (Dark)
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        {story.summary && (
          <div className="mb-6 prose prose-gray dark:prose-invert max-w-none text-lg">
            <p>{story.summary}</p>
          </div>
        )}
        {!hintDismissed && (
          <div className="flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
            <span>Select a Spanish word or phrase for a translation.</span>
            <button
              onClick={dismissHint}
              className="shrink-0 p-1 rounded hover:bg-muted-foreground/20 transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-card">
          <TranscriptDisplay
            transcription={story.transcription}
            currentTime={currentTime}
            onPhraseSelect={handlePhraseSelect}
            selectedIndices={selectedIndices}
          />
        </div>
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
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:hidden',
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
          <div className="md:rounded-lg md:border md:border-gray-200 dark:md:border-gray-700 p-4 md:bg-[#fafafa] md:dark:bg-card">
            <WordExplanationPanel
              phrase={selectedPhrase}
              translation={wordData?.translation ?? null}
              explanation={wordData?.explanation ?? null}
              isLoading={isLoadingWord}
              englishOnly={englishOnly}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
