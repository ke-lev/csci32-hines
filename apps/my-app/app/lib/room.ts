// Mirrors apps/backend/src/services/message-validation.ts. The backend is the trust boundary;
// this copy keeps the composer from offering a message the server refuses.

export const MAX_MESSAGE_LENGTH = 500

export function normalizeMessageBody(value: string) {
  let stripped = ''

  for (const character of value.replace(/[\r\n\t]+/g, ' ')) {
    const code = character.codePointAt(0) ?? 0

    if (code < 32 || code === 127) continue

    stripped += character
  }

  return stripped.replace(/ {2,}/g, ' ').trim()
}

/** Returns the reason the body cannot be sent, or null when it can. */
export function checkMessageBody(body: string): string | null {
  const value = normalizeMessageBody(body)

  if (!value) return 'type something first'
  if (value.length > MAX_MESSAGE_LENGTH) return `keep it under ${MAX_MESSAGE_LENGTH} characters`

  return null
}
