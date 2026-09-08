'use client'

import { useEffect, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { ROOM_MESSAGES_QUERY, type RoomLine } from '../talk/use-room'

const DELETE_MESSAGE_MUTATION = graphql(`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`)

export function TalkPanel() {
  const [lines, setLines] = useState<RoomLine[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    gqlClient
      .request(ROOM_MESSAGES_QUERY, { limit: 50 })
      .then((result) => setLines(result.roomMessages as RoomLine[]))
      .catch(() => setError('could not load the room'))
  }, [])

  async function remove(messageId: string) {
    try {
      await gqlClient.request(DELETE_MESSAGE_MUTATION, { messageId })
      setLines((current) => current.filter((line) => line.messageId !== messageId))
    } catch {
      setError('could not delete that line')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto font-mono text-[0.7rem]">
      {error ? <p className="m-0 text-danger lowercase">{error}</p> : null}
      {lines.map((line) => (
        <div className="flex items-start justify-between gap-3" key={line.messageId}>
          <span className="min-w-0 flex-1 truncate">
            {line.kind === 'system' ? `* ${line.body}` : `<${line.authorUsername ?? 'someone'}> ${line.body}`}
          </span>
          <button
            className="text-danger lowercase underline"
            onClick={() => void remove(line.messageId)}
            type="button"
          >
            delete
          </button>
        </div>
      ))}
      {lines.length === 0 && !error ? <p className="m-0 text-muted lowercase">nothing to moderate</p> : null}
    </div>
  )
}
