import { describe, expect, it } from 'vitest'
import { decodeRoomCursor, encodeRoomCursor } from '../../backend/src/services/room-cursor'

describe('room cursors', () => {
  it('round-trips a timestamp and id', () => {
    const createdAt = new Date('2026-09-07T12:00:00.000Z')
    const decoded = decodeRoomCursor(encodeRoomCursor(createdAt, 'abc123'))

    expect(decoded?.createdAt.toISOString()).toBe(createdAt.toISOString())
    expect(decoded?.messageId).toBe('abc123')
  })

  it('sorts lexically in the same order as the rows', () => {
    const older = encodeRoomCursor(new Date('2026-09-07T12:00:00.000Z'), 'aaa')
    const newer = encodeRoomCursor(new Date('2026-09-07T12:00:01.000Z'), 'aaa')

    expect(older < newer).toBe(true)
  })

  it('rejects malformed cursors rather than throwing', () => {
    expect(decodeRoomCursor('not-a-cursor')).toBeNull()
    expect(decodeRoomCursor('')).toBeNull()
    expect(decodeRoomCursor(undefined)).toBeNull()
    expect(decodeRoomCursor(12)).toBeNull()
  })

  it('rejects a cursor carrying an unparseable date', () => {
    expect(decodeRoomCursor(Buffer.from('nope|abc123').toString('base64url'))).toBeNull()
  })
})
