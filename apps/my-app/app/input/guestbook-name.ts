/**
 * Server-side name rules for the guestbook. Kept free of `server-only` and Prisma so the
 * validation on the write path can be exercised directly, and so the action and the tests
 * agree on exactly one definition of a valid name.
 */
import { normalizeFaceSeed } from './generate-face'

export const MAX_NAME_LENGTH = 40
export const MAX_SEED_LENGTH = MAX_NAME_LENGTH * 2 + 1

export const DRAWING_KINDS = ['face', 'cat'] as const

export type DrawingKindName = (typeof DRAWING_KINDS)[number]

// letters and marks from any script, plus the punctuation that shows up in real names.
// deliberately excludes digits, control characters, and anything that could carry markup.
const allowedName = /^[\p{L}\p{M}][\p{L}\p{M} '’\-.]*$/u

export type NameCheck = { ok: true; seed: string } | { ok: false; reason: string }

export function isDrawingKind(value: unknown): value is DrawingKindName {
  return DRAWING_KINDS.includes(value as DrawingKindName)
}

export function checkGuestbookName(first: unknown, last: unknown): NameCheck {
  if (typeof first !== 'string' || typeof last !== 'string') {
    return { ok: false, reason: 'that name did not arrive as text' }
  }

  const trimmedFirst = first.trim()
  const trimmedLast = last.trim()

  if (trimmedFirst.length === 0) {
    return { ok: false, reason: 'a first name is required' }
  }

  if (trimmedFirst.length > MAX_NAME_LENGTH || trimmedLast.length > MAX_NAME_LENGTH) {
    return { ok: false, reason: `keep each name to ${MAX_NAME_LENGTH} characters or fewer` }
  }

  if (!allowedName.test(trimmedFirst) || (trimmedLast.length > 0 && !allowedName.test(trimmedLast))) {
    return { ok: false, reason: 'letters, spaces, hyphens, periods, and apostrophes only' }
  }

  // the seed is re-derived here rather than accepted from the client: it is the identity
  // column, so the server has to be the one that decides what it is.
  const seed = normalizeFaceSeed(trimmedFirst, trimmedLast)

  if (seed.length === 0 || seed.length > MAX_SEED_LENGTH) {
    return { ok: false, reason: 'that name does not normalize to anything signable' }
  }

  return { ok: true, seed }
}
