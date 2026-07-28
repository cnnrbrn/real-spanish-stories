import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { PanelRightClose, PanelRightOpen, Volume2, X } from 'lucide-react'
import { STORY_LEVELS } from '@real-spanish-stories/shared'
import { translatePhrase } from '../api'
import { findNextSibling } from '../utils/next-sibling'
import { createStoryTitle } from '../utils/story'
// import { LevelBadge } from './level-badge'
import { LevelProgressionPanel } from './level-progression-panel'
import { SkipToStorySwitch } from './skip-to-story-switch'
import { StoryAutoplaySwitch } from './story-autoplay-switch'
import { StoryDownloads } from './story-downloads'
import { TranscriptDisplay } from './transcript-display'
import { VideoPlayer } from './video-player'
import { WordExplanationPanel } from './word-explanation-panel'
import type { VideoPlayerHandle } from './video-player'
import { useGlosses } from '@/features/translate/use-glosses'
import type {
  StoryDetail,
  TranscriptionWord,
  TranslationResponse,
} from '@real-spanish-stories/shared'
import { PageContainer } from '@/components/ui/page'
import { usePreferencesStore } from '@/stores/preferences'

interface StoryDetailsProps {
  story: StoryDetail
}

export function StoryDetails({ story }: StoryDetailsProps) {
  const playerRef = useRef<VideoPlayerHandle>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [wordData, setWordData] = useState<{
    translation: string
    explanation: string[]
  } | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [englishOnly, setEnglishOnly] = useState(false)
  const glosses = useGlosses()
  const levelAutoplay = usePreferencesStore((s) => s.levelAutoplay)
  const skipToStory = usePreferencesStore((s) => s.skipToStory)
  const startSeconds =
    skipToStory && story.storyStartMs ? story.storyStartMs / 1000 : undefined
  const navigate = useNavigate()
  const { autoplay } = useSearch({ from: '/story/$slug' })

  function handleVideoEnded() {
    if (!levelAutoplay) return
    const next = findNextSibling(story.level, story.siblings)
    if (!next) return
    navigate({
      to: '/story/$slug',
      params: { slug: next.slug },
      search: { autoplay: true },
    })
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    loIndex,
    hiIndex,
  }: {
    words: TranscriptionWord[]
    phrase: string
    loIndex: number
    hiIndex: number
  }) {
    if (words.length === 0) return

    // Non-Spanish selection: no gloss, just the side-panel hint.
    if (words.every((w) => w.language === 'en')) {
      setSidebarOpen(true)
      playerRef.current?.seekTo(words[0].start)
      setSelectedPhrase(phrase)
      setWordData(null)
      setEnglishOnly(true)
      return
    }
    setEnglishOnly(false)

    // A new selection removes any glosses it overlaps; re-selecting an existing
    // phrase exactly toggles it off, in which case there's nothing more to do.
    if (glosses.select(loIndex, hiIndex, phrase) === 'removed') return

    setSidebarOpen(true)
    playerRef.current?.seekTo(words[0].start)
    setSelectedPhrase(phrase)
    setWordData(null)
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
    <PageContainer width="wide">
      {(() => {
        const level = STORY_LEVELS.find((l) => l.value === story.level)
        return (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              to="/"
              className="hover:text-foreground transition-colors shrink-0"
            >
              Home
            </Link>
            {level && (
              <>
                <span className="shrink-0">/</span>
                <Link
                  to="/stories/$levelSlug"
                  params={{ levelSlug: level.urlSlug }}
                  className="hover:text-foreground transition-colors shrink-0"
                >
                  {level.label} Spanish Stories
                </Link>
              </>
            )}
            <span className="shrink-0">/</span>
            <span className="text-foreground min-w-0 truncate">
              {story.altTitle || story.title}
            </span>
          </nav>
        )
      })()}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {story.videoLink && (
            <div className="mb-6 aspect-video bg-black">
              <VideoPlayer
                ref={playerRef}
                key={story.videoLink}
                videoUrl={story.videoLink}
                title={story.altTitle || story.title}
                onTimeUpdate={setCurrentTime}
                onEnded={handleVideoEnded}
                autoPlay={autoplay}
                startSeconds={startSeconds}
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
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2">
              {/* Level badge removed: the <h1> and the all-levels grid below
                  already state the level.
              <div className="self-start">
                <LevelBadge level={story.level} size="lg" />
              </div>
              */}
              <StoryDownloads story={story} />
            </div>
          </div>
          <div className="md:hidden mb-6">
            <LevelProgressionPanel
              currentLevel={story.level}
              levels={story.siblings}
              altTitle={story.altTitle}
              variant="compact"
            />
          </div>
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 text-lg italic text-muted-foreground">
              <Volume2 className="w-5 h-5 shrink-0" />
              Narrated in clear Argentine (rioplatense) Spanish
            </span>
          </div>
          {story.summary && (
            <div className="prose prose-lg dark:prose-invert mb-6 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: story.summary }} />
            </div>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Transcript
          </h2>
          <p className="text-lg text-muted-foreground mb-3">
            Select a Spanish word or phrase for a translation.
          </p>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-card">
            <TranscriptDisplay
              transcription={story.transcription}
              currentTime={currentTime}
              onPhraseSelect={handlePhraseSelect}
              glosses={glosses.glosses}
            />
            {/* TODO(seo): consider adding a comprehension-questions block here once
                the feature exists (see transcript-display.tsx TODO) — would help
                thin pages, especially at the Absolute Beginner level. */}
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
          <div className="px-4 pb-4 md:p-0 space-y-4">
            <div className="">
              <div className="flex items-center justify-end gap-3">
                <SkipToStorySwitch />
                <StoryAutoplaySwitch />
              </div>
            </div>
            <div className="md:rounded-lg md:border md:border-gray-200 dark:md:border-gray-700 p-4 md:bg-[#fafafa] md:dark:bg-card">
              <LevelProgressionPanel
                currentLevel={story.level}
                levels={story.siblings}
                altTitle={story.altTitle}
              />
            </div>
            {(selectedPhrase || isLoadingWord) && (
              <div className="md:rounded-lg md:border md:border-gray-200 dark:md:border-gray-700 p-4 md:bg-[#fafafa] md:dark:bg-card">
                <WordExplanationPanel
                  phrase={selectedPhrase}
                  translation={wordData?.translation ?? null}
                  explanation={wordData?.explanation ?? null}
                  isLoading={isLoadingWord}
                  englishOnly={englishOnly}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
