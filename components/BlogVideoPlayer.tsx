'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from '@/components/Link'

interface BlogVideoPlayerProps {
  src: string
  title?: string
  poster?: string
  captionsSrc?: string
  watchHref?: string
  variant?: 'embedded' | 'featured'
}

const CAPTIONS_PREF_KEY = 'blog-video-cc-enabled'
const CONTROLS_HIDE_DELAY_MS = 3000

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function BlogVideoPlayer({
  src,
  title,
  poster,
  captionsSrc,
  watchHref,
  variant = 'embedded',
}: BlogVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideControlsTimerRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [captionsEnabled, setCaptionsEnabled] = useState(false)

  const hasCaptions = Boolean(captionsSrc)
  const shouldShowLargePlay =
    !isPlaying && (currentTime <= 0.1 || Math.abs(duration - currentTime) < 0.2)

  const applyCaptionMode = useCallback((enabled: boolean) => {
    const track = videoRef.current?.textTracks?.[0]
    if (!track) return
    track.mode = enabled ? 'showing' : 'hidden'
  }, [])

  const clearHideControlsTimer = useCallback(() => {
    if (hideControlsTimerRef.current != null) {
      window.clearTimeout(hideControlsTimerRef.current)
      hideControlsTimerRef.current = null
    }
  }, [])

  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimer()
    if (videoRef.current?.paused !== false) return
    hideControlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, CONTROLS_HIDE_DELAY_MS)
  }, [clearHideControlsTimer])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      try {
        await video.play()
      } catch {
        // Ignore autoplay/playback promise failures from browser policies.
      }
      return
    }

    video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const toggleCaptions = () => {
    if (!hasCaptions) return
    const nextValue = !captionsEnabled
    setCaptionsEnabled(nextValue)
    applyCaptionMode(nextValue)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CAPTIONS_PREF_KEY, String(nextValue))
    }
  }

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    if (containerRef.current?.requestFullscreen) {
      await containerRef.current.requestFullscreen()
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !hasCaptions) return
    const saved = window.localStorage.getItem(CAPTIONS_PREF_KEY)
    if (saved === 'true') {
      setCaptionsEnabled(true)
    }
  }, [hasCaptions])

  useEffect(() => {
    applyCaptionMode(captionsEnabled)
  }, [applyCaptionMode, captionsEnabled])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
      setShowControls(true)
      scheduleHideControls()
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [scheduleHideControls])

  useEffect(() => {
    return () => clearHideControlsTimer()
  }, [clearHideControlsTimer])

  const cardWidthClass = variant === 'featured' ? 'mx-auto max-w-4xl' : ''

  return (
    <div
      className={`blog-video-player not-prose mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 ${cardWidthClass}`}
      role="region"
      aria-label={title ? `Video: ${title}` : 'Post video'}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Watch</p>
        {watchHref && (
          <Link
            href={watchHref}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium"
          >
            Open in watch view
          </Link>
        )}
      </div>

      <div
        ref={containerRef}
        role="button"
        aria-label="Video player"
        tabIndex={0}
        className="group relative aspect-video overflow-hidden rounded-lg bg-gray-900 outline-none"
        onPointerMove={() => {
          setShowControls(true)
          scheduleHideControls()
        }}
        onPointerLeave={() => {
          if (isPlaying) setShowControls(false)
        }}
        onClick={() => {
          void togglePlayPause()
          setShowControls(true)
          scheduleHideControls()
        }}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLInputElement) return
          const key = event.key.toLowerCase()
          if (key === ' ' || key === 'k') {
            event.preventDefault()
            void togglePlayPause()
            return
          }
          if (key === 'm') {
            event.preventDefault()
            toggleMute()
            return
          }
          if (key === 'f') {
            event.preventDefault()
            void toggleFullscreen()
            return
          }
          if (key === 'c' && hasCaptions) {
            event.preventDefault()
            toggleCaptions()
          }
        }}
      >
        {/* Captions are optional per post; when absent we keep native player behavior without a track. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          preload="metadata"
          playsInline
          poster={poster}
          className="h-full w-full"
          onLoadedMetadata={() => {
            const video = videoRef.current
            if (!video) return
            setDuration(video.duration || 0)
            setCurrentTime(video.currentTime || 0)
            setIsMuted(video.muted)
            applyCaptionMode(captionsEnabled)
          }}
          onTimeUpdate={() => {
            const video = videoRef.current
            if (!video) return
            setCurrentTime(video.currentTime)
          }}
          onPlay={() => {
            setIsPlaying(true)
            setShowControls(true)
            scheduleHideControls()
          }}
          onPause={() => {
            setIsPlaying(false)
            setShowControls(true)
            clearHideControlsTimer()
          }}
          onEnded={() => {
            setIsPlaying(false)
            setShowControls(true)
            clearHideControlsTimer()
          }}
          onVolumeChange={() => {
            const video = videoRef.current
            if (!video) return
            setIsMuted(video.muted)
          }}
        >
          <source src={src} />
          {captionsSrc ? (
            <track
              kind="captions"
              src={captionsSrc}
              srcLang="en"
              label="English"
              default={captionsEnabled}
            />
          ) : (
            <track kind="captions" src="" srcLang="en" label="No captions available" />
          )}
        </video>

        {shouldShowLargePlay && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              void togglePlayPause()
            }}
            className="bg-primary-500 hover:bg-primary-600 focus-visible:outline-primary-500 absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={currentTime > 0 ? 'Replay video' : 'Play video'}
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gray-950/80 px-3 py-2 text-gray-200 backdrop-blur-sm transition-opacity duration-200 ${
            showControls || !isPlaying || isFullscreen ? 'opacity-100' : 'opacity-0'
          }`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void togglePlayPause()}
              className="hover:text-primary-300 focus-visible:outline-primary-500 rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => {
                const nextTime = Number(event.target.value)
                const video = videoRef.current
                if (!video || Number.isNaN(nextTime)) return
                video.currentTime = nextTime
                setCurrentTime(nextTime)
              }}
              className="accent-primary-500 min-w-0 flex-1"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration || 0)}
              aria-valuenow={Math.floor(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            />

            <span className="min-w-[86px] text-right text-xs text-gray-300 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {hasCaptions && (
              <button
                type="button"
                onClick={toggleCaptions}
                className={`focus-visible:outline-primary-500 rounded px-2 py-1 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  captionsEnabled
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'hover:text-primary-300 text-gray-300'
                }`}
                aria-label={captionsEnabled ? 'Turn captions off' : 'Turn captions on'}
                aria-pressed={captionsEnabled}
              >
                CC
              </button>
            )}

            <button
              type="button"
              onClick={toggleMute}
              className="hover:text-primary-300 focus-visible:outline-primary-500 rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M16.5 12 20 15.5l-1.5 1.5L15 13.5 11.5 17 10 15.5l3.5-3.5L10 8.5 11.5 7 15 10.5 18.5 7 20 8.5zM5 9h4l5-4v14l-5-4H5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M5 9h4l5-4v14l-5-4H5zM17 9a1 1 0 0 1 1.4 0A4.5 4.5 0 0 1 20 12a4.5 4.5 0 0 1-1.6 3 1 1 0 0 1-1.4-1.4c.66-.6 1-1.1 1-1.6s-.34-1-1-1.6A1 1 0 0 1 17 9z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="hover:text-primary-300 focus-visible:outline-primary-500 rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M7 14h3v3h2v-5H7zM14 14v5h5v-5h-2v3h-3zM7 5v5h2V7h3V5zM17 10h2V5h-5v2h3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M5 5h7v2H7v5H5zm12 0h2v7h-2V7h-5V5zM5 12h2v5h5v2H5zm12 0h2v7h-7v-2h5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
