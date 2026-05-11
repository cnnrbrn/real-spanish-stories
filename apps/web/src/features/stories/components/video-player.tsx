import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import videojs from 'video.js'
import 'videojs-youtube'
import { getYouTubeThumbnail } from '../utils/video'
import type Player from 'video.js/dist/types/player'

export interface VideoPlayerHandle {
  seekTo: (time: number) => void
}

interface VideoPlayerProps {
  videoUrl: string
  title?: string
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  autoPlay?: boolean
  startSeconds?: number
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    { videoUrl, title, onTimeUpdate, onEnded, autoPlay, startSeconds },
    ref,
  ) {
    const videoRef = useRef<HTMLDivElement | null>(null)
    const playerRef = useRef<Player | null>(null)
    const onEndedRef = useRef(onEnded)
    onEndedRef.current = onEnded
    const startSecondsRef = useRef(startSeconds)
    startSecondsRef.current = startSeconds

    useImperativeHandle(ref, () => ({
      seekTo(time: number) {
        playerRef.current?.currentTime(time)
      },
    }))

    useEffect(() => {
      if (!playerRef.current) {
        const videoElement = document.createElement('video-js')
        videoElement.classList.add('vjs-big-play-centered')
        videoRef.current?.appendChild(videoElement)

        const thumbnail = getYouTubeThumbnail(videoUrl, 'maxresdefault')

        const player = videojs(videoElement, {
          controls: true,
          responsive: true,
          fluid: true,
          techOrder: ['youtube'],
          poster: thumbnail || undefined,
          autoplay: !!autoPlay,
          controlBar: {
            fullscreenToggle: true,
          },
          sources: [
            {
              src: videoUrl,
              type: 'video/youtube',
            },
          ],
        })

        player.on('timeupdate', () => {
          onTimeUpdate?.(player.currentTime() ?? 0)
        })

        player.on('ended', () => {
          onEndedRef.current?.()
        })

        player.on('loadedmetadata', () => {
          const start = startSecondsRef.current
          if (start && start > 0) player.currentTime(start)
        })

        playerRef.current = player
      } else {
        // Update existing player
        const player = playerRef.current
        const thumbnail = getYouTubeThumbnail(videoUrl, 'maxresdefault')

        player.poster(thumbnail || '')
        player.src({
          src: videoUrl,
          type: 'video/youtube',
        })
        if (autoPlay) {
          player.play()?.catch(() => {
            // browser blocked autoplay
          })
        }
      }
    }, [videoUrl, autoPlay])

    useEffect(() => {
      const player = playerRef.current

      return () => {
        if (player && !player.isDisposed()) {
          player.dispose()
          playerRef.current = null
        }
      }
    }, [])

    return (
      <div data-vjs-player className="w-full">
        <div ref={videoRef} />
      </div>
    )
  },
)
