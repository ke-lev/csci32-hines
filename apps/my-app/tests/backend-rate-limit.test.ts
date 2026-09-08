import { beforeEach, describe, expect, it } from 'vitest'
import { checkRateLimit, resetRateLimits } from '../../backend/src/utils/rate-limit'

describe('backend rate limit', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('allows up to the limit inside one window', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 }).allowed).toBe(true)
    }
  })

  it('refuses the attempt past the limit and reports the wait', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    const refused = checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 31_000 })

    expect(refused.allowed).toBe(false)
    expect(refused.retryAfterMs).toBe(30_000)
  })

  it('starts a fresh window once the old one expires', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    expect(checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 62_000 }).allowed).toBe(true)
  })

  it('counts each key separately', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    expect(checkRateLimit({ key: 'user-2', limit: 10, windowMs: 60_000, now: 1_000 }).allowed).toBe(true)
  })
})
