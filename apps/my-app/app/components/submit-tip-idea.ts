'use server'

import { headers } from 'next/headers'
import { checkRateLimit } from '../lib/rate-limit'
import { saveTipIdea } from '../lib/tip-ideas'

export type SubmitTipIdeaResult = { ok: true } | { ok: false; reason: string }

const MAX_IDEA_LENGTH = 2000
const IDEAS_PER_WINDOW = 4
const WINDOW_MS = 60_000

async function getClientKey() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  return `tip-idea:${forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown'}`
}

export async function submitTipIdea(body: string): Promise<SubmitTipIdeaResult> {
  const idea = body.trim()

  if (!idea) return { ok: false, reason: 'write an idea first' }
  if (idea.length > MAX_IDEA_LENGTH) {
    return { ok: false, reason: `keep it under ${MAX_IDEA_LENGTH.toLocaleString()} characters` }
  }

  const limit = checkRateLimit({
    key: await getClientKey(),
    limit: IDEAS_PER_WINDOW,
    windowMs: WINDOW_MS,
  })

  if (!limit.allowed) {
    return { ok: false, reason: `slow down — try again in ${Math.ceil(limit.retryAfterMs / 1000)}s` }
  }

  try {
    await saveTipIdea(idea)
    return { ok: true }
  } catch (error) {
    console.error('failed to save tip idea', error)
    return { ok: false, reason: 'the database did not take that one' }
  }
}
