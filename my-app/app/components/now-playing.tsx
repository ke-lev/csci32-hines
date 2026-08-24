'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type NowPlayingResponse =
  | { state: 'idle' | 'unavailable' }
  | {
      state: 'paused' | 'playing' | 'recent'
      track: {
        albumArtUrl: string | null
        artist: string
        name: string
        spotifyUrl: string
      }
    }

function SpotifyMark() {
  return (
    <svg aria-label="Spotify" className="h-5 w-5 shrink-0" role="img" viewBox="0 0 24 24">
      <path
        d="M12 1.75A10.25 10.25 0 1 0 12 22.25 10.25 10.25 0 0 0 12 1.75Zm4.7 14.78a.64.64 0 0 1-.88.21c-2.42-1.48-5.47-1.81-9.06-.99a.64.64 0 1 1-.28-1.25c3.93-.9 7.3-.52 10.01 1.14.3.18.4.58.21.89Zm1.25-2.78a.8.8 0 0 1-1.1.26c-2.77-1.7-6.99-2.19-10.27-1.2a.8.8 0 1 1-.46-1.53c3.75-1.13 8.4-.58 11.57 1.36.38.23.5.73.26 1.11Zm.11-2.9C14.74 8.88 9.25 8.7 6.08 9.66a.96.96 0 1 1-.56-1.84c3.65-1.1 9.72-.89 13.52 1.36a.96.96 0 0 1-.98 1.67Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[7, 11, 5].map((height, index) => (
        <span
          className={active ? 'animate-[pulse_1s_ease-in-out_infinite] bg-accent' : 'bg-muted'}
          key={height}
          style={{
            animationDelay: `${index * 160}ms`,
            height,
            width: 2,
          }}
        />
      ))}
    </span>
  )
}

function EmptyArtwork() {
  return (
    <div
      className="grid size-16 shrink-0 place-items-center rounded-lg border border-line bg-row-hover"
      aria-hidden="true"
    >
      <span className="grid size-9 place-items-center rounded-full border border-muted/50">
        <span className="size-2 rounded-full bg-muted" />
      </span>
    </div>
  )
}

export function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function refresh() {
      try {
        const response = await fetch('/api/spotify/now-playing', { cache: 'no-store' })
        const data = (await response.json()) as NowPlayingResponse

        if (isCurrent) {
          setNowPlaying(response.ok ? data : { state: 'unavailable' })
        }
      } catch {
        if (isCurrent) {
          setNowPlaying({ state: 'unavailable' })
        }
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }

    void refresh()
    const interval = window.setInterval(refreshWhenVisible, 30_000)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      isCurrent = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [])

  const hasTrack = nowPlaying?.state === 'playing' || nowPlaying?.state === 'paused' || nowPlaying?.state === 'recent'
  const status =
    nowPlaying === null
      ? 'checking the speakers'
      : nowPlaying.state === 'playing'
        ? 'currently listening to'
        : nowPlaying.state === 'paused'
          ? 'paused on'
          : nowPlaying.state === 'recent'
            ? 'recently played'
            : nowPlaying.state === 'idle'
              ? 'nothing spinning right now'
              : 'spotify is offline'

  const content = (
    <>
      {hasTrack && nowPlaying.track.albumArtUrl ? (
        <Image
          alt=""
          className="size-16 shrink-0 rounded-lg object-cover"
          height={64}
          sizes="64px"
          src={nowPlaying.track.albumArtUrl}
          width={64}
        />
      ) : (
        <EmptyArtwork />
      )}

      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="mb-2 flex items-center gap-2 overflow-hidden font-mono text-[0.64rem] font-semibold tracking-[0.06em] whitespace-nowrap text-muted lowercase">
          <Equalizer active={nowPlaying?.state === 'playing'} />
          {status}
        </span>
        <span
          className="truncate text-[0.98rem] leading-tight font-semibold tracking-[-0.02em]"
          title={hasTrack ? nowPlaying.track.name : undefined}
        >
          {hasTrack ? nowPlaying.track.name : 'quiet hours'}
        </span>
        <span
          className="mt-1 truncate text-[0.78rem] leading-5 text-muted"
          title={hasTrack ? nowPlaying.track.artist : undefined}
        >
          {hasTrack ? nowPlaying.track.artist : 'check back in a bit'}
        </span>
      </span>

      <span className="self-start text-foreground" title="Spotify">
        <SpotifyMark />
      </span>
    </>
  )

  return (
    <section
      className="min-h-24 w-[min(100%,19rem)] overflow-hidden rounded-2xl border border-line bg-background"
      aria-atomic="true"
      aria-label="Spotify listening status"
      aria-live="polite"
    >
      {hasTrack ? (
        <a
          className="group flex min-h-[94px] items-center gap-3 p-3 pl-4 transition-colors duration-180 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#cbff4a] motion-reduce:transition-none"
          href={nowPlaying.track.spotifyUrl}
          rel="noopener noreferrer"
          target="_blank"
          aria-label={`${status}: ${nowPlaying.track.name} by ${nowPlaying.track.artist}. Listen on Spotify; opens in a new tab.`}
        >
          {content}
        </a>
      ) : (
        <div className="flex min-h-[94px] items-center gap-3 p-3">{content}</div>
      )}
    </section>
  )
}
