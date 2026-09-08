import { describe, expect, it } from 'vitest'
import { checkMessageBody, MAX_MESSAGE_LENGTH, normalizeMessageBody } from '../app/lib/room'
import {
  MAX_MESSAGE_LENGTH as BACKEND_MAX_MESSAGE_LENGTH,
  validateMessageBody,
} from '../../backend/src/services/message-validation'

describe('message body validation', () => {
  it('keeps the client and server bounds identical', () => {
    expect(MAX_MESSAGE_LENGTH).toBe(BACKEND_MAX_MESSAGE_LENGTH)
  })

  it('accepts a body the backend also accepts', () => {
    expect(checkMessageBody('  hey  ')).toBeNull()
    expect(validateMessageBody('  hey  ')).toEqual({ ok: true, value: 'hey' })
  })

  it('rejects a blank body on both sides', () => {
    expect(checkMessageBody('   ')).toBe('type something first')
    expect(validateMessageBody('   ')).toEqual({ ok: false, reason: 'type something first' })
  })

  it('rejects a body over the cap on both sides', () => {
    const tooLong = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)

    expect(checkMessageBody(tooLong)).toBe(`keep it under ${MAX_MESSAGE_LENGTH} characters`)
    expect(validateMessageBody(tooLong)).toEqual({
      ok: false,
      reason: `keep it under ${MAX_MESSAGE_LENGTH} characters`,
    })
  })

  it('collapses newlines and strips control characters', () => {
    expect(normalizeMessageBody('a\r\nb\tc')).toBe('a b c')
  })

  it('refuses a non-string body on the server', () => {
    expect(validateMessageBody(42)).toEqual({ ok: false, reason: 'type something first' })
  })
})
