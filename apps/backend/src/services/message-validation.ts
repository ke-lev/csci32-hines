export const MAX_MESSAGE_LENGTH = 500

export type MessageValidation = { ok: true; value: string } | { ok: false; reason: string }

/**
 * A room line is a single run of printable text. Unlike the intro copy, newlines are collapsed
 * rather than kept: a message is one line in a transcript, and a pasted wall of newlines would
 * otherwise let one post own the whole viewport.
 */
export function normalizeMessageBody(value: string) {
  let stripped = ''

  for (const character of value.replace(/[\r\n\t]+/g, ' ')) {
    const code = character.codePointAt(0) ?? 0

    if (code < 32 || code === 127) continue

    stripped += character
  }

  return stripped.replace(/ {2,}/g, ' ').trim()
}

export function validateMessageBody(body: unknown): MessageValidation {
  if (typeof body !== 'string') return { ok: false, reason: 'type something first' }

  const value = normalizeMessageBody(body)

  if (!value) return { ok: false, reason: 'type something first' }
  if (value.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: `keep it under ${MAX_MESSAGE_LENGTH} characters` }
  }

  return { ok: true, value }
}
