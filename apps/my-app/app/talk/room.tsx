'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Variant } from '@repo/ui/variant'
import { useAuth } from '../components/use-auth'
import { MAX_MESSAGE_LENGTH } from '../lib/room'
import { useProfile } from './use-profile'
import { useRoom, type RoomLine } from './use-room'

const MOTD = 'one room. be nice.'
// far enough from the floor that a reader who scrolled up on purpose is not dragged back down
const PINNED_SLACK_PX = 80

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function dayKey(iso: string) {
  return new Date(iso).toDateString()
}

function formatDay(iso: string) {
  const at = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dayKey(iso) === today.toDateString()) return 'today'
  if (dayKey(iso) === yesterday.toDateString()) return 'yesterday'

  return at
    .toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      ...(at.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
    })
    .toLowerCase()
}

export function Room({ canPost }: { canPost: boolean }) {
  const pathname = usePathname()
  const { recoverSession } = useAuth()
  const { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post, retry, status } = useRoom({
    recoverSession,
  })
  const { close, open, profile } = useProfile()
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const transcript = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLInputElement>(null)
  const isPinned = useRef(true)
  const hasLanded = useRef(false)
  const seenCount = useRef(0)
  // set just before older lines are requested, so the restore below can put the reader back on the
  // line they were reading instead of wherever the taller transcript pushed it
  const historyAnchor = useRef<number | null>(null)

  // the room is here to be typed in, so the caret starts in the composer rather than nowhere
  useEffect(() => {
    if (canPost) composer.current?.focus({ preventScroll: true })
  }, [canPost])

  useEffect(() => {
    const element = transcript.current

    if (!element) return

    if (historyAnchor.current !== null) {
      element.scrollTop = element.scrollHeight - historyAnchor.current
      historyAnchor.current = null
      return
    }

    // the room opens on the newest line, whatever the transcript's height turns out to be
    if (!hasLanded.current && messages.length > 0) {
      element.scrollTop = element.scrollHeight
      hasLanded.current = true
      seenCount.current = messages.length
      setUnreadCount(0)
      return
    }

    if (isPinned.current) {
      element.scrollTop = element.scrollHeight
      seenCount.current = messages.length
      setUnreadCount(0)
      return
    }

    setUnreadCount(Math.max(0, messages.length - seenCount.current))
  }, [messages])

  function handleScroll() {
    const element = transcript.current

    if (!element) return

    isPinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < PINNED_SLACK_PX

    if (isPinned.current) {
      seenCount.current = messages.length
      setUnreadCount(0)
    }
  }

  function jumpToNewest() {
    const element = transcript.current

    if (!element) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollTo({ top: element.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
    isPinned.current = true
    seenCount.current = messages.length
    setUnreadCount(0)
  }

  function readOlder() {
    const element = transcript.current

    // measured from the bottom, which is the part that does not move when lines are prepended
    if (element) historyAnchor.current = element.scrollHeight - element.scrollTop

    void loadOlder()
  }

  async function send() {
    // Enter reaches this even while the send button is disabled, and a second request would post
    // the same line twice.
    if (isPosting || draft.trim().length === 0) return

    // your own line always pulls you back to the newest, even if you were reading history
    isPinned.current = true

    const sent = draft
    const result = await post(sent)

    if (!result.ok) {
      setSendError(result.reason)
      return
    }

    // whatever was typed while the request was in flight is the next message, not this one
    setDraft((current) => (current === sent ? '' : current))
    setSendError(null)
  }

  // a line that opens a new day carries the separator above it
  const rows = messages.map((line, index) => ({
    line,
    startsDay: index === 0 || dayKey(line.createdAt) !== dayKey(messages[index - 1].createdAt),
  }))

  function renderLine({ line, startsDay }: { line: RoomLine; startsDay: boolean }) {
    return (
      <li key={line.messageId}>
        {startsDay ? (
          <p className="m-0 flex items-center gap-3 py-3 font-mono text-[0.6rem] tracking-[0.14em] text-muted lowercase">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            {formatDay(line.createdAt)}
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </p>
        ) : null}

        <span className="block font-mono text-[0.72rem] leading-[1.5]">
          <span className="text-muted">{formatTime(line.createdAt)}</span>{' '}
          {line.kind === 'system' ? (
            <span className="text-muted">* {line.body}</span>
          ) : (
            <>
              <button
                className="text-accent underline underline-offset-2"
                onClick={() => void open(line.authorUsername ?? '')}
                type="button"
              >
                {line.authorUsername ?? 'someone'}
              </button>{' '}
              <span className="text-foreground">{line.body}</span>
            </>
          )}
        </span>
      </li>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {profile ? (
        <div className="border-b border-line px-[clamp(18px,2vw,28px)] py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[0.72rem] text-accent">{profile.username}</p>
              {profile.state === 'ready' ? (
                <>
                  {profile.introSubhead ? (
                    <p className="m-0 mt-1 text-sm leading-[1.5] text-subhead">{profile.introSubhead}</p>
                  ) : null}
                  {profile.introBody ? (
                    <p className="m-0 mt-1 text-sm leading-[1.5] text-muted">{profile.introBody}</p>
                  ) : null}
                </>
              ) : (
                <p
                  className={`m-0 mt-1 font-mono text-[0.66rem] lowercase ${
                    profile.state === 'error' ? 'text-danger' : 'text-muted'
                  }`}
                >
                  {profile.state === 'loading'
                    ? 'loading...'
                    : profile.state === 'error'
                      ? 'could not load that profile'
                      : 'no profile yet'}
                </p>
              )}
            </div>
            <button className="font-mono text-[0.66rem] text-muted lowercase underline" onClick={close} type="button">
              close
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="min-h-0 flex-1 overflow-y-auto px-[clamp(18px,2vw,28px)] pt-4 pb-8"
          onScroll={handleScroll}
          ref={transcript}
        >
          <p className="m-0 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase">{MOTD}</p>

          {hasOlder && messages.length > 0 ? (
            <button
              className="mt-3 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase underline"
              onClick={readOlder}
              type="button"
            >
              load older
            </button>
          ) : null}

          <ol className="m-0 mt-4 flex list-none flex-col gap-2 p-0">{rows.map(renderLine)}</ol>

          {isLoaded && messages.length === 0 ? (
            <p className="m-0 mt-4 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase">nothing here yet</p>
          ) : null}
        </div>

        <button
          className={`absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[0.64rem] tracking-[0.06em] text-foreground lowercase shadow-[0_8px_24px_rgb(0_0_0/22%)] transition duration-200 hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none ${
            unreadCount > 0 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          }`}
          disabled={unreadCount === 0}
          onClick={jumpToNewest}
          type="button"
        >
          ↓ {unreadCount} new {unreadCount === 1 ? 'line' : 'lines'}
        </button>
      </div>

      <div className="border-t border-line px-[clamp(18px,2vw,28px)] py-4">
        {canPost ? (
          <div className="flex items-center gap-3">
            <input
              aria-label="message"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[0.72rem] text-foreground caret-accent outline-none placeholder:text-muted"
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => {
                setDraft(event.currentTarget.value)
                setSendError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void send()
              }}
              placeholder="say something"
              ref={composer}
              value={draft}
            />
            <Button
              disabled={isPosting || draft.trim().length === 0}
              onClick={() => void send()}
              variant={Variant.PRIMARY}
            >
              {isPosting ? 'sending...' : 'send'}
            </Button>
          </div>
        ) : (
          <p className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase">
            <Link
              className="text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground"
              href={`/users/?next=${encodeURIComponent(pathname)}`}
            >
              sign in
            </Link>{' '}
            to say something — it brings you back here
          </p>
        )}

        {sendError ? (
          <p className="m-0 mt-2 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase" role="alert">
            {sendError}
          </p>
        ) : null}

        {status !== 'live' ? (
          <p
            className="m-0 mt-2 flex items-center gap-2 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase"
            aria-live="polite"
          >
            {status === 'connecting' ? (
              'connecting...'
            ) : (
              <>
                {loadError ?? 'lost the room'}
                <button className="text-foreground underline underline-offset-4" onClick={retry} type="button">
                  retry
                </button>
              </>
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}
