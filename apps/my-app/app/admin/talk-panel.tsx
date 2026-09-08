'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../components/use-auth'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { handleTone } from '../talk/handle-tone'
import { ROOM_MESSAGES_QUERY, type RoomLine } from '../talk/use-room'
import { controlClasses, noticeClasses, rowClasses, toolbarClasses } from './console-styles'

const DELETE_MESSAGE_MUTATION = graphql(`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`)

type PanelState = 'idle' | 'loaded' | 'error'

const PAGE_SIZE = 50

type TalkPanelProps = {
  onCountChange?: (count: number) => void
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TalkPanel({ onCountChange }: TalkPanelProps) {
  const { user } = useAuth()
  const [lines, setLines] = useState<RoomLine[]>([])
  const [panelState, setPanelState] = useState<PanelState>('idle')
  const [error, setError] = useState<string | null>(null)
  // moderation is one click from destroying someone's line, so the click arms and a second confirms
  const [armedId, setArmedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [hasOlder, setHasOlder] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)

  useEffect(() => {
    let cancelled = false

    gqlClient
      .request(ROOM_MESSAGES_QUERY, { limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return

        // newest first: the line that needs moderating is almost always the one just posted
        const roomLines = [...(result.roomMessages as RoomLine[])].reverse()
        setLines(roomLines)
        setHasOlder(roomLines.length === PAGE_SIZE)
        setPanelState('loaded')
        onCountChange?.(roomLines.length)
      })
      .catch(() => {
        if (cancelled) return

        setPanelState('error')
        setError('could not load the room')
      })

    return () => {
      cancelled = true
    }
  }, [onCountChange])

  // Fifty lines is not a moderation queue. The oldest line held is the last one, since the list
  // runs newest first.
  async function loadOlder() {
    const oldest = lines[lines.length - 1]

    if (!oldest) return

    setIsLoadingOlder(true)

    try {
      const result = await gqlClient.request(ROOM_MESSAGES_QUERY, { before: oldest.cursor, limit: PAGE_SIZE })
      const older = [...(result.roomMessages as RoomLine[])].reverse()

      setHasOlder(older.length === PAGE_SIZE)
      setLines((current) => {
        const seen = new Set(current.map((line) => line.messageId))
        const next = [...current, ...older.filter((line) => !seen.has(line.messageId))]
        onCountChange?.(next.length)

        return next
      })
      setError(null)
    } catch {
      setError('could not load older lines')
    } finally {
      setIsLoadingOlder(false)
    }
  }

  async function remove(messageId: string) {
    setBusyId(messageId)

    try {
      await gqlClient.request(DELETE_MESSAGE_MUTATION, { messageId })
      setLines((current) => {
        const next = current.filter((line) => line.messageId !== messageId)
        onCountChange?.(next.length)

        return next
      })
      setError(null)
    } catch {
      setError('could not delete that line')
    } finally {
      setBusyId(null)
      setArmedId(null)
    }
  }

  if (panelState === 'idle') return <p className={noticeClasses}>loading the room…</p>

  if (panelState === 'error') return <p className={noticeClasses}>{error}</p>

  if (lines.length === 0) return <p className={noticeClasses}>nothing to moderate</p>

  return (
    <>
      <div className={`${toolbarClasses} justify-between`}>
        <p className="m-0 font-mono text-[0.64rem] tracking-[0.05em] text-muted" aria-live="polite">
          {lines.length === 1 ? '1 line' : `${lines.length} lines`}, newest first
        </p>
        {error ? (
          <p className="m-0 font-mono text-[0.64rem] tracking-[0.05em] text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {lines.map((line) => {
        const isArmed = line.messageId === armedId
        const isBusy = line.messageId === busyId
        const author = line.authorUsername ?? 'someone'

        return (
          <div
            className={`${rowClasses} grid-cols-[auto_minmax(0,1fr)_auto] transition-colors duration-180 hover:bg-row-hover motion-reduce:transition-none ${
              isArmed ? 'bg-danger-surface' : ''
            }`}
            key={line.messageId}
          >
            <span className="font-mono text-[0.64rem] whitespace-nowrap tabular-nums text-muted">
              {formatStamp(line.createdAt)}
            </span>

            <span className="min-w-0 font-mono text-[0.68rem] leading-[1.5] break-words">
              {line.kind === 'system' ? (
                <span className="text-muted">
                  <span aria-hidden="true">* </span>
                  {line.body}
                </span>
              ) : (
                <>
                  <span className={handleTone(author, user?.username)}>{author}</span> <span className="text-foreground">{line.body}</span>
                </>
              )}
            </span>

            {isArmed ? (
              <span className="flex items-center gap-2">
                <button
                  className={`${controlClasses} border-danger text-danger hover:bg-danger-surface`}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void remove(line.messageId)}
                >
                  {isBusy ? 'deleting…' : 'confirm'}
                </button>
                <button
                  className={controlClasses}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setArmedId(null)}
                >
                  cancel
                </button>
              </span>
            ) : (
              <button
                className={`${controlClasses} text-muted hover:border-danger hover:text-danger hover:bg-background`}
                type="button"
                aria-label={line.kind === 'system' ? 'Delete system line' : `Delete the line from ${author}`}
                onClick={() => setArmedId(line.messageId)}
              >
                delete
              </button>
            )}
          </div>
        )
      })}

      {hasOlder ? (
        <div className="flex justify-center border-b border-line px-[clamp(18px,2vw,28px)] py-3">
          <button className={controlClasses} disabled={isLoadingOlder} onClick={() => void loadOlder()} type="button">
            {isLoadingOlder ? 'loading…' : 'load older'}
          </button>
        </div>
      ) : null}
    </>
  )
}
