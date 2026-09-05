'use server'

import { headers } from 'next/headers'
import { checkRateLimit } from '../lib/rate-limit'
import { findTipIdeaStatus, saveTipIdea, TIP_IDEA_RECEIPT_PATTERN, type TipIdeaPublicStatus } from '../lib/tip-ideas'

export type SubmitTipIdeaResult = { ok: true; receipt: string } | { ok: false; reason: string }
export type CheckTipIdeaResult =
  { ok: true; shippedHref: string | null; status: TipIdeaPublicStatus } | { ok: false; reason: string }

const MAX_IDEA_LENGTH = 2000
const IDEAS_PER_WINDOW = 4
const WINDOW_MS = 60_000
const STATUS_CHECKS_PER_WINDOW = 12

async function getClientKey() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  return `tip-idea:${forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown'}`
}

async function getStatusClientKey() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  return `tip-idea-status:${forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown'}`
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
    const saved = await saveTipIdea(idea)
    return { ok: true, receipt: saved.receipt }
  } catch (error) {
    console.error('failed to save tip idea', error)
    return { ok: false, reason: 'the database did not take that one' }
  }
}

export async function checkTipIdeaStatus(receipt: string): Promise<CheckTipIdeaResult> {
  const normalizedReceipt = receipt.trim()

  if (!TIP_IDEA_RECEIPT_PATTERN.test(normalizedReceipt)) {
    return { ok: false, reason: 'that receipt does not look right' }
  }

  const limit = checkRateLimit({
    key: await getStatusClientKey(),
    limit: STATUS_CHECKS_PER_WINDOW,
    windowMs: WINDOW_MS,
  })

  if (!limit.allowed) {
    return { ok: false, reason: `slow down — try again in ${Math.ceil(limit.retryAfterMs / 1000)}s` }
  }

  try {
    const idea = await findTipIdeaStatus(normalizedReceipt)
    if (!idea) return { ok: false, reason: 'no idea found for that receipt' }

    if (idea.status !== 'heard' && idea.status !== 'trying_it' && idea.status !== 'shipped') {
      return { ok: false, reason: 'that idea has an unknown status' }
    }

    return { ok: true, shippedHref: idea.shipped_href, status: idea.status }
  } catch (error) {
    console.error('failed to check tip idea status', error)
    return { ok: false, reason: 'the database did not answer that one' }
  }
}
