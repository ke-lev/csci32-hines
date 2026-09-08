import { pickFor } from '../input/seeded-random'

/**
 * The palette stays narrow on purpose, so handles are toned rather than colored: the accent means
 * "you" and nothing else, and every other speaker takes a deterministic step on the warm neutral
 * ramp. Muted is left out because timestamps and system lines already own it, and a handle should
 * never read as chrome.
 *
 * Same name, same tone, on every device — the seed is the handle itself, hashed by the same
 * function that turns a name into a face on /input.
 */
const HANDLE_TONES = ['text-foreground', 'text-subhead', 'text-footer'] as const

export function handleTone(username: string | null | undefined, currentUsername?: string | null) {
  if (!username) return 'text-muted'
  if (currentUsername && username === currentUsername) return 'text-accent'

  return pickFor(username, 'room-handle', HANDLE_TONES)
}
