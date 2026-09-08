/**
 * An opaque (created_at, message_id) pair. Both halves travel together because cuid is not
 * monotonic: ordering by timestamp alone is ambiguous when two lines land in the same
 * millisecond, and a cursor of just an id would cost a lookup before every page.
 *
 * The ISO timestamp leads, so base64url cursors compare lexically in timeline order - the room
 * hook relies on that to keep merged pages sorted without decoding.
 */
export function encodeRoomCursor(createdAt: Date, messageId: string) {
  return Buffer.from(`${createdAt.toISOString()}|${messageId}`).toString('base64url')
}

export function decodeRoomCursor(cursor: unknown): { createdAt: Date; messageId: string } | null {
  if (typeof cursor !== 'string' || !cursor) return null

  const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
  const separator = decoded.indexOf('|')

  if (separator < 1) return null

  const createdAt = new Date(decoded.slice(0, separator))
  const messageId = decoded.slice(separator + 1)

  if (Number.isNaN(createdAt.getTime()) || !messageId) return null

  return { createdAt, messageId }
}
