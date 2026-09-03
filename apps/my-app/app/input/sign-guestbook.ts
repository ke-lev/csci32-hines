'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { checkRateLimit } from '../lib/rate-limit'
import { GUESTBOOK_CACHE_TAG, signGuestbook } from '../lib/guestbook'
import { checkGuestbookName, isDrawingKind } from './guestbook-name'

export type SignResult = { ok: true; seed: string } | { ok: false; reason: string }

const SIGNINGS_PER_WINDOW = 6
const WINDOW_MS = 60_000

async function getClientKey() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  return forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * The only write path into the guestbook. Nothing here trusts the client: the seed is
 * re-derived from the submitted names, and the drawing kind is checked against the enum.
 */
export async function signGuestbookAction(
  firstName: string,
  lastName: string,
  drawingKind: string,
): Promise<SignResult> {
  const name = checkGuestbookName(firstName, lastName)

  if (!name.ok) return name

  if (!isDrawingKind(drawingKind)) {
    return { ok: false, reason: 'that is not a drawing kind' }
  }

  const limit = checkRateLimit({
    key: await getClientKey(),
    limit: SIGNINGS_PER_WINDOW,
    windowMs: WINDOW_MS,
  })

  if (!limit.allowed) {
    return { ok: false, reason: `slow down — try again in ${Math.ceil(limit.retryAfterMs / 1000)}s` }
  }

  try {
    await signGuestbook(name.seed, drawingKind)
  } catch {
    // the real error stays in the server log; the visitor gets nothing to probe with.
    return { ok: false, reason: 'the guestbook did not take that one' }
  }

  updateTag(GUESTBOOK_CACHE_TAG)

  return { ok: true, seed: name.seed }
}
