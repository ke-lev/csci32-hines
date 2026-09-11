'use client'

import { ClientError } from 'graphql-request'
import { useCallback, useEffect, useRef, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { checkMessageBody } from '../lib/room'

export const ROOM_MESSAGES_QUERY = graphql(`
  query RoomMessages($after: String, $before: String, $limit: Int, $includePostingAllowance: Boolean! = false) {
    roomMessages(after: $after, before: $before, limit: $limit) {
      messageId
      kind
      body
      authorUsername
      createdAt
      cursor
    }
    postingAllowance @include(if: $includePostingAllowance) {
      remaining
      resetAt
    }
  }
`)

const POST_MESSAGE_MUTATION = graphql(`
  mutation PostMessage($body: String!) {
    postMessage(input: { body: $body }) {
      messageId
      kind
      body
      authorUsername
      createdAt
      cursor
    }
  }
`)

const POLL_INTERVAL_MS = 5_000
const PAGE_SIZE = 50
// A forward cursor can only ever add, so a moderated line would sit there until reload. Every sixth
// poll re-reads the newest page instead, which is half a minute of lag on a rare event.
const RECONCILE_EVERY = 6

export type RoomLine = {
  messageId: string
  kind: 'user' | 'system'
  body: string
  authorUsername: string | null
  createdAt: string
  cursor: string
}

export type RoomStatus = 'connecting' | 'live' | 'retrying'

export type PostResult = { ok: true } | { ok: false; reason: string }

export type PostingAllowance = { remaining: number; resetInSeconds: number }

function compareRoomLines(left: RoomLine, right: RoomLine) {
  if (left.createdAt !== right.createdAt) return left.createdAt < right.createdAt ? -1 : 1
  if (left.messageId === right.messageId) return 0

  return left.messageId < right.messageId ? -1 : 1
}

/** The server's own words when it refuses a message — the rate limit's countdown, say. */
function refusalReason(caughtError: unknown, fallback: string) {
  if (!(caughtError instanceof ClientError)) return fallback

  const graphQLError = caughtError.response.errors?.[0]

  if (graphQLError?.extensions?.code !== 'BAD_USER_INPUT') return fallback

  return graphQLError.message || fallback
}

/**
 * Polls rather than subscribes. graphql-request has no subscription transport, and at this room's
 * size a five-second cursor poll is indistinguishable from a live socket. Polling pauses while the
 * tab is hidden, so a backgrounded dashboard is not a standing query every five seconds.
 */
export function useRoom({
  canPost,
  recoverSession,
}: {
  canPost: boolean
  recoverSession: (caughtError: unknown) => boolean
}) {
  const [messages, setMessages] = useState<RoomLine[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState<RoomStatus>('connecting')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [hasOlder, setHasOlder] = useState(true)
  const [postingAllowance, setPostingAllowance] = useState<PostingAllowance | null>(null)
  // Only a poll moves this. Posting used to advance it to your own line, which skipped anyone who
  // spoke since the last poll: their row is older than yours, so the next `after` query missed it.
  const polledCursor = useRef<string | null>(null)
  const syncCount = useRef(0)

  // Rows are ordered by the same pair encoded by the cursor. Comparing the explicit fields keeps
  // the merge correct because base64url itself does not preserve the source string's ordering.
  const merge = useCallback((incoming: RoomLine[]) => {
    if (!incoming.length) return

    setMessages((current) => {
      const seen = new Set(current.map((line) => line.messageId))
      const added = incoming.filter((line) => !seen.has(line.messageId))

      if (!added.length) return current

      return [...current, ...added].sort(compareRoomLines)
    })
  }, [])

  // The newest page is the whole truth about its own range: anything loaded inside it that the
  // server no longer returns has been moderated away, and anything older is left alone.
  const applyWindow = useCallback((window: RoomLine[]) => {
    setMessages((current) => {
      if (!window.length) return current.length ? [] : current

      const oldest = window[0]
      const newest = window[window.length - 1]
      const live = new Set(window.map((line) => line.messageId))
      // Outside the window nothing can be judged: older lines are history the window never covered,
      // and a newer one is a message posted while this request was in flight.
      const kept = current.filter(
        (line) => compareRoomLines(line, oldest) < 0 || compareRoomLines(line, newest) > 0 || live.has(line.messageId),
      )
      const keptIds = new Set(kept.map((line) => line.messageId))
      const added = window.filter((line) => !keptIds.has(line.messageId))

      if (!added.length && kept.length === current.length) return current

      return [...kept, ...added].sort(compareRoomLines)
    })
  }, [])

  const sync = useCallback(async () => {
    const isFirstSync = syncCount.current === 0
    const isReconcile = !polledCursor.current || syncCount.current % RECONCILE_EVERY === 0
    syncCount.current += 1

    try {
      const result = await gqlClient.request(ROOM_MESSAGES_QUERY, {
        after: isReconcile ? null : polledCursor.current,
        includePostingAllowance: canPost,
        limit: PAGE_SIZE,
      })
      const rows = result.roomMessages as RoomLine[]

      const allowance = result.postingAllowance
      setPostingAllowance(
        canPost && allowance
          ? {
              remaining: allowance.remaining,
              resetInSeconds: Math.max(0, Math.ceil((new Date(allowance.resetAt).getTime() - Date.now()) / 1000)),
            }
          : null,
      )

      if (isReconcile) applyWindow(rows)
      else merge(rows)

      if (rows.length) polledCursor.current = rows[rows.length - 1].cursor
      else if (isReconcile) polledCursor.current = null

      // Only the opening page can answer this: once history has been paged in, the newest page says
      // nothing about what sits behind the oldest line held.
      if (isFirstSync) setHasOlder(rows.length === PAGE_SIZE)

      setLoadError(null)
      setStatus('live')
      setIsLoaded(true)
    } catch (caughtError) {
      if (recoverSession(caughtError)) return

      setStatus('retrying')
      setLoadError('could not reach the room')
    }
  }, [applyWindow, canPost, merge, recoverSession])

  useEffect(() => {
    void sync()

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void sync()
    }, POLL_INTERVAL_MS)

    // coming back to the tab should not cost a five-second wait for the room to catch up
    function catchUp() {
      if (document.visibilityState === 'visible') void sync()
    }

    document.addEventListener('visibilitychange', catchUp)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', catchUp)
    }
  }, [sync])

  const retry = useCallback(() => {
    setStatus('connecting')
    void sync()
  }, [sync])

  const loadOlder = useCallback(async () => {
    const oldest = messages[0]?.cursor

    if (!oldest) return

    try {
      const result = await gqlClient.request(ROOM_MESSAGES_QUERY, { before: oldest, limit: PAGE_SIZE })
      const older = result.roomMessages as RoomLine[]

      // a short page means there is nothing further back
      setHasOlder(older.length === PAGE_SIZE)
      merge(older)
    } catch (caughtError) {
      if (recoverSession(caughtError)) return

      setLoadError('could not load older lines')
    }
  }, [merge, messages, recoverSession])

  const post = useCallback(
    async (body: string): Promise<PostResult> => {
      const localReason = checkMessageBody(body)

      if (localReason) return { ok: false, reason: localReason }

      setIsPosting(true)

      try {
        const result = await gqlClient.request(POST_MESSAGE_MUTATION, { body })

        merge([result.postMessage as RoomLine])

        return { ok: true }
      } catch (caughtError) {
        if (recoverSession(caughtError)) {
          return { ok: false, reason: 'your session expired - sign in again' }
        }

        return { ok: false, reason: refusalReason(caughtError, 'could not send that') }
      } finally {
        setIsPosting(false)
      }
    },
    [merge, recoverSession],
  )

  return { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post, postingAllowance, retry, status }
}
