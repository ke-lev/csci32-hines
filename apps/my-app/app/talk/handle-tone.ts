/**
 * Two colors carry the room: everyone speaking is blue, and you are green. It reads instantly —
 * your own lines pick themselves out of a fast-moving transcript without needing to read the name.
 *
 * This does spend both signal colors on identity rather than state, which is a deliberate
 * exception to the palette's rare-signal and semantic-wash rules for this one surface.
 */
export function handleTone(username: string | null | undefined, currentUsername?: string | null) {
  if (!username) return 'text-muted'
  if (currentUsername && username === currentUsername) return 'text-success'

  return 'text-accent'
}
