/**
 * A fixed-window counter kept in process memory, ported from the guestbook limiter in
 * apps/my-app/app/lib/rate-limit.ts. That copy guards a Next server action and cannot see a
 * GraphQL mutation. This is a spam barrier, not a distributed limiter: each backend instance
 * counts on its own and the counts reset whenever the process does.
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
