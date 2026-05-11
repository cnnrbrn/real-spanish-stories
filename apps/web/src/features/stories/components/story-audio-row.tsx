import { Link, useRouteContext } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { STORY_LEVELS, type StoryResponse } from '@real-spanish-stories/shared'
import { pauseOthers, playNext, registerPlayer } from '../utils/audio-coordinator'
import { getYouTubeThumbnail } from '../utils/video'
import { LevelBadge } from './level-badge'
import { authClient } from '@/lib/auth-client'
import { useAuthModals } from '@/stores/auth-modals'
import { usePreferencesStore } from '@/stores/preferences'

interface StoryAudioRowProps {
  story: StoryResponse
}

export function StoryAudioRow({ story }: StoryAudioRowProps) {
  const { session: ctxSession } = useRouteContext({ from: '__root__' })
  const { data: clientSession, isPending } = authClient.useSession()
  const session = isPending ? ctxSession : clientSession
  const openLogin = useAuthModals((s) => s.openLogin)
  const audioVolume = usePreferencesStore((s) => s.audioVolume)
  const setAudioVolume = usePreferencesStore((s) => s.setAudioVolume)
  const audioMuted = usePreferencesStore((s) => s.audioMuted)
  const setAudioMuted = usePreferencesStore((s) => s.setAudioMuted)
  const levelAutoplay = usePreferencesStore((s) => s.levelAutoplay)
  const skipToStory = usePreferencesStore((s) => s.skipToStory)

  const audioRef = useRef<HTMLAudioElement>(null)
  const handleLoadAndPlayRef = useRef<() => void>(() => {})
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const thumbnail = story.videoLink
    ? getYouTubeThumbnail(story.videoLink, 'hqdefault')
    : null
  const levelLabel = STORY_LEVELS.find((l) => l.value === story.level)?.label
  const displayTitle = `${story.altTitle || story.title}${levelLabel ? ` - ${levelLabel} Spanish` : ''}`

  useEffect(() => {
    if (!audioRef.current) return
    return registerPlayer(story.id, audioRef.current, () => {
      handleLoadAndPlayRef.current()
    })
  }, [story.id])

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {
        // browser blocked autoplay — user can press the native play button
      })
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume
  }, [audioVolume, audioUrl])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = audioMuted
  }, [audioMuted, audioUrl])

  handleLoadAndPlayRef.current = handleLoadAndPlay

  async function handleLoadAndPlay() {
    if (!session) {
      openLogin({ headline: "Log in to play. It's free." })
      return
    }
    if (loading || audioUrl) return
    setLoading(true)
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}stories/${story.id}/audio/play`
      const res = await fetch(apiUrl, { credentials: 'include' })
      if (!res.ok) {
        toast.error('Could not start playback. Please try again.')
        return
      }
      const { url } = (await res.json()) as { url: string }
      setAudioUrl(url)
    } catch {
      toast.error('Could not start playback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:flex-row md:items-center md:gap-4">
      <div className="flex items-center gap-3 min-w-0 md:flex-1 md:gap-4">
        <Link
          to="/story/$slug"
          params={{ slug: story.slug }}
          className="shrink-0"
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={displayTitle}
              className="w-24 md:w-32 aspect-video object-cover rounded-md"
            />
          ) : (
            <div className="w-24 md:w-32 aspect-video bg-gray-100 dark:bg-gray-800 rounded-md" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to="/story/$slug"
            params={{ slug: story.slug }}
            className="block text-base font-semibold text-gray-900 dark:text-gray-100 hover:underline"
          >
            {displayTitle}
          </Link>
          <div className="mt-1 hidden md:block">
            <LevelBadge level={story.level} asSpan />
          </div>
        </div>
      </div>
      {story.audioFilename && (
        <div className="relative w-full md:w-80 md:shrink-0">
          <audio
            ref={audioRef}
            src={audioUrl ?? undefined}
            controls
            onLoadedMetadata={() => {
              if (audioRef.current && skipToStory && story.storyStartMs) {
                audioRef.current.currentTime = story.storyStartMs / 1000
              }
            }}
            onPlay={() => pauseOthers(story.id)}
            onEnded={() => {
              if (levelAutoplay) playNext(story.id)
            }}
            onVolumeChange={(e) => {
              setAudioVolume(e.currentTarget.volume)
              setAudioMuted(e.currentTarget.muted)
            }}
            className="w-full"
          />
          {!audioUrl && (
            <>
              <button
                type="button"
                onClick={handleLoadAndPlay}
                disabled={loading}
                aria-label={loading ? 'Loading audio' : 'Play audio'}
                className="absolute inset-0 cursor-pointer bg-transparent border-0 disabled:cursor-wait"
              />
              {loading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-white/70 dark:bg-gray-900/70">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-700 dark:text-gray-200" />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
