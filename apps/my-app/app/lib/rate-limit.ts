/**
 * A fixed-window counter kept in module memory. This is a spam barrier for a guestbook, not
 * a distributed rate limiter: each server instance counts on its own, and the counts reset
 * whenever the process does. The unique (seed, kind) constraint does the rest of the work by
 * making repeat signings idempotent instead of expensive.
 */
type Window = { count: number; resetAt: number }

const windows = new Map<string, Window>()
const MAX_TRACKED_KEYS = 5000

export type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
  now?: number
}

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions) {
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) {
      for (const [trackedKey, window] of windows) {
        if (window.resetAt <= now) windows.delete(trackedKey)
      }

      // still full of live windows: refuse rather than let the map grow without a bound.
      if (windows.size >= MAX_TRACKED_KEYS) return { allowed: false, retryAfterMs: windowMs }
    }

    windows.set(key, { count: 1, resetAt: now + windowMs })

    return { allowed: true, retryAfterMs: 0 }
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now }
  }

  existing.count += 1

  return { allowed: true, retryAfterMs: 0 }
}

export function resetRateLimits() {
  windows.clear()
}
