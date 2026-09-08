export const MAX_INTRO_TITLE_LENGTH = 80
export const MAX_INTRO_SUBHEAD_LENGTH = 140
export const MAX_INTRO_BODY_LENGTH = 240

export type IntroField = 'introTitle' | 'introSubhead' | 'introBody'

export type IntroFieldErrors = Partial<Record<IntroField, string>>

export type IntroInputLike = {
  introBody?: unknown
  introSubhead?: unknown
  introTitle?: unknown
}

export type ValidatedIntro = {
  introBody: string
  introSubhead: string
  introTitle: string
}

export type IntroValidation = { ok: true; value: ValidatedIntro } | { fieldErrors: IntroFieldErrors; ok: false }

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

/** Normalizes line endings and strips control characters so stored copy stays printable text. */
export function normalizeIntroText(value: string, { allowNewlines }: { allowNewlines: boolean }) {
  const withoutCarriageReturns = value.replace(/\r\n?/g, '\n')
  const withNewlinePolicy = allowNewlines ? withoutCarriageReturns : withoutCarriageReturns.replace(/\n+/g, ' ')

  return stripControlCharacters(withNewlinePolicy).trim()
}

export function validateIntroInput(input: IntroInputLike): IntroValidation {
  const fieldErrors: IntroFieldErrors = {}
  const introTitle = normalizeIntroText(typeof input.introTitle === 'string' ? input.introTitle : '', {
    allowNewlines: true,
  })
  const introSubhead = normalizeIntroText(typeof input.introSubhead === 'string' ? input.introSubhead : '', {
    allowNewlines: false,
  })
  const introBody = normalizeIntroText(typeof input.introBody === 'string' ? input.introBody : '', {
    allowNewlines: true,
  })

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

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, ok: false }
  }

  return { ok: true, value: { introBody, introSubhead, introTitle } }
}
