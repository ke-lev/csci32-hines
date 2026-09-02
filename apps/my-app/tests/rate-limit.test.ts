import { beforeEach, describe, expect, it } from 'vitest'
import { checkRateLimit, resetRateLimits } from '../app/lib/rate-limit'

beforeEach(() => {
  resetRateLimits()
})

describe('checkRateLimit', () => {
  it('allows up to the limit inside one window', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(checkRateLimit({ key: 'a', limit: 3, windowMs: 1000, now: 0 }).allowed).toBe(true)
    }

    expect(checkRateLimit({ key: 'a', limit: 3, windowMs: 1000, now: 0 }).allowed).toBe(false)
  })

  it('reports how long the caller has to wait', () => {
    checkRateLimit({ key: 'a', limit: 1, windowMs: 1000, now: 0 })

    expect(checkRateLimit({ key: 'a', limit: 1, windowMs: 1000, now: 400 }).retryAfterMs).toBe(600)
  })

  it('opens a fresh window once the old one expires', () => {
    checkRateLimit({ key: 'a', limit: 1, windowMs: 1000, now: 0 })

    expect(checkRateLimit({ key: 'a', limit: 1, windowMs: 1000, now: 1000 }).allowed).toBe(true)
  })

  it('counts each key separately', () => {
    checkRateLimit({ key: 'a', limit: 1, windowMs: 1000, now: 0 })

    expect(checkRateLimit({ key: 'b', limit: 1, windowMs: 1000, now: 0 }).allowed).toBe(true)
  })
})
