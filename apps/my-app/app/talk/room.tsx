'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Variant } from '@repo/ui/variant'
import { useAuth } from '../components/use-auth'
import { MAX_MESSAGE_LENGTH } from '../lib/room'
import { useRoom } from './use-room'

const MOTD = 'one room. be nice.'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function Room({ canPost }: { canPost: boolean }) {
  const { recoverSession } = useAuth()
  const { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post } = useRoom({ recoverSession })
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const transcript = useRef<HTMLDivElement>(null)

  // pin to the newest line, unless the reader has scrolled up to read history
  useEffect(() => {
    const element = transcript.current

    if (!element) return

    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80

    if (isNearBottom) element.scrollTop = element.scrollHeight
  }, [messages])

  async function send() {
    const result = await post(draft)

    if (!result.ok) {
      setSendError(result.reason)
      return
    }

    setDraft('')
    setSendError(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(18px,2vw,28px)] py-4" ref={transcript}>
        <p className="m-0 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase">{MOTD}</p>

        {hasOlder && messages.length > 0 ? (
          <button
            className="mt-3 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase underline"
            onClick={() => void loadOlder()}
            type="button"
          >
            load older
          </button>
        ) : null}

        <ol className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {messages.map((line) => (
            <li className="font-mono text-[0.72rem] leading-[1.5]" key={line.messageId}>
              <span className="text-muted">{formatTime(line.createdAt)}</span>{' '}
              {line.kind === 'system' ? (
                <span className="text-muted">* {line.body}</span>
              ) : (
                <>
                  <span className="text-accent">{line.authorUsername ?? 'someone'}</span>{' '}
                  <span className="text-foreground">{line.body}</span>
                </>
              )}
            </li>
          ))}
        </ol>

        {isLoaded && messages.length === 0 ? (
          <p className="m-0 mt-4 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase">nothing here yet</p>
        ) : null}
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
            sign in to say something
          </p>
        )}

        {sendError || loadError ? (
          <p className="m-0 mt-2 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase" role="alert">
            {sendError || loadError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
