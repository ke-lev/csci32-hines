'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { checkMessageBody } from '../lib/room'

export const ROOM_MESSAGES_QUERY = graphql(`
  query RoomMessages($after: String, $before: String, $limit: Int) {
    roomMessages(after: $after, before: $before, limit: $limit) {
      messageId
      kind
      body
      authorUsername
      createdAt
      cursor
    }
  }
`)

const POST_MESSAGE_MUTATION = graphql(`
  mutation PostMessage($body: String!) {
    postMessage(body: $body) {
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

export type RoomLine = {
  messageId: string
  kind: 'user' | 'system'
  body: string
  authorUsername: string | null
  createdAt: string
  cursor: string
}

export type PostResult = { ok: true } | { ok: false; reason: string }

/**
 * Polls rather than subscribes. graphql-request has no subscription transport, and at this room's
 * size a five-second cursor poll is indistinguishable from a live socket. Polling pauses while the
 * tab is hidden, so a backgrounded dashboard is not a standing query every five seconds.
 */
export function useRoom({ recoverSession }: { recoverSession: (caughtError: unknown) => boolean }) {
  const [messages, setMessages] = useState<RoomLine[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [hasOlder, setHasOlder] = useState(true)
  const newestCursor = useRef<string | null>(null)

  // cursors sort lexically in timeline order (see room-cursor.ts), so merging never decodes them
  const merge = useCallback((incoming: RoomLine[]) => {
    if (!incoming.length) return

    setMessages((current) => {
      const seen = new Set(current.map((line) => line.messageId))
      const added = incoming.filter((line) => !seen.has(line.messageId))

      if (!added.length) return current

      const next = [...current, ...added].sort((left, right) => (left.cursor < right.cursor ? -1 : 1))
      newestCursor.current = next[next.length - 1]?.cursor ?? null

      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const result = await gqlClient.request(ROOM_MESSAGES_QUERY, {
          after: newestCursor.current,
          limit: PAGE_SIZE,
        })

        if (cancelled) return

        merge(result.roomMessages as RoomLine[])
        setLoadError(null)
        setIsLoaded(true)
      } catch (caughtError) {
        if (cancelled || recoverSession(caughtError)) return

        setLoadError('could not reach the room')
      }
    }

    void poll()

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void poll()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [merge, recoverSession])

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

        return { ok: false, reason: 'could not send that' }
      } finally {
        setIsPosting(false)
      }
    },
    [merge, recoverSession],
  )

  return { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post }
}
