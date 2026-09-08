// Mirrors apps/backend/src/services/personal-page-validation.ts. The backend is the trust
// boundary; this copy keeps the intro form from offering copy the server refuses.

export const MAX_INTRO_TITLE_LENGTH = 80
export const MAX_INTRO_SUBHEAD_LENGTH = 140
export const MAX_INTRO_BODY_LENGTH = 240

export type IntroField = 'introTitle' | 'introSubhead' | 'introBody'

export type IntroFieldErrors = Partial<Record<IntroField, string>>

export type IntroInput = {
  introBody: string
  introSubhead: string
  introTitle: string
}

/** Drops control characters but keeps tab and newline, which the intro fields legitimately use. */
function stripControlCharacters(value: string) {
  let stripped = ''

  for (const character of value) {
    const code = character.codePointAt(0) ?? 0

    if ((code < 32 && code !== 9 && code !== 10) || code === 127) continue

    stripped += character
  }

  return stripped
}

export function normalizeIntroText(value: string, { allowNewlines }: { allowNewlines: boolean }) {
  const withoutCarriageReturns = value.replace(/\r\n?/g, '\n')
  const withNewlinePolicy = allowNewlines ? withoutCarriageReturns : withoutCarriageReturns.replace(/\n+/g, ' ')

  return stripControlCharacters(withNewlinePolicy).trim()
}

export function validateIntroInput(input: IntroInput): IntroFieldErrors {
  const fieldErrors: IntroFieldErrors = {}
  const introTitle = normalizeIntroText(input.introTitle, { allowNewlines: true })
  const introSubhead = normalizeIntroText(input.introSubhead, { allowNewlines: false })
  const introBody = normalizeIntroText(input.introBody, { allowNewlines: true })

  if (!introTitle) {
    fieldErrors.introTitle = 'add a title'
  } else if (introTitle.length > MAX_INTRO_TITLE_LENGTH) {
    fieldErrors.introTitle = `keep the title under ${MAX_INTRO_TITLE_LENGTH} characters`
  }

  if (!introSubhead) {
    fieldErrors.introSubhead = 'add a subhead'
  } else if (introSubhead.length > MAX_INTRO_SUBHEAD_LENGTH) {
    fieldErrors.introSubhead = `keep the subhead under ${MAX_INTRO_SUBHEAD_LENGTH} characters`
  }

  if (introBody.length > MAX_INTRO_BODY_LENGTH) {
    fieldErrors.introBody = `keep the note under ${MAX_INTRO_BODY_LENGTH} characters`
  }

  return fieldErrors
}
