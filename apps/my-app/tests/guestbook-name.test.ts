import { describe, expect, it } from 'vitest'
import { checkGuestbookName, isDrawingKind, MAX_NAME_LENGTH } from '../app/input/guestbook-name'

describe('checkGuestbookName', () => {
  it('normalizes a name into the seed the drawing is keyed on', () => {
    const result = checkGuestbookName('  John  ', ' DOE ')

    expect(result).toEqual({ ok: true, seed: 'john doe' })
  })

  it('accepts a first name on its own', () => {
    expect(checkGuestbookName('larry', '')).toEqual({ ok: true, seed: 'larry' })
  })

  it('accepts the punctuation that shows up in real names', () => {
    expect(checkGuestbookName("beans", "n'rice").ok).toBe(true)
    expect(checkGuestbookName('anne-marie', 'o’brien').ok).toBe(true)
    expect(checkGuestbookName('józef', 'skłodowski').ok).toBe(true)
  })

  it('requires a first name', () => {
    expect(checkGuestbookName('   ', 'doe').ok).toBe(false)
  })

  it('rejects markup, digits, and control characters', () => {
    expect(checkGuestbookName('<script>alert(1)</script>', '').ok).toBe(false)
    expect(checkGuestbookName('robert', 'tables; drop').ok).toBe(false)
    expect(checkGuestbookName('agent', '007').ok).toBe(false)
    expect(checkGuestbookName('line\nbreak', '').ok).toBe(false)
  })

  it('rejects a name longer than the input allows', () => {
    expect(checkGuestbookName('a'.repeat(MAX_NAME_LENGTH), '').ok).toBe(true)
    expect(checkGuestbookName('a'.repeat(MAX_NAME_LENGTH + 1), '').ok).toBe(false)
  })

  it('rejects anything that is not a string', () => {
    expect(checkGuestbookName(null, 'doe').ok).toBe(false)
    expect(checkGuestbookName('john', 42).ok).toBe(false)
  })
})

describe('isDrawingKind', () => {
  it('only accepts the two kinds the schema stores', () => {
    expect(isDrawingKind('face')).toBe(true)
    expect(isDrawingKind('cat')).toBe(true)
    expect(isDrawingKind('dog')).toBe(false)
    expect(isDrawingKind(undefined)).toBe(false)
  })
})
