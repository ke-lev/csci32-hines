export const MAX_INTRO_TITLE_LENGTH = 80
export const MAX_INTRO_SUBHEAD_LENGTH = 140
export const MAX_INTRO_BODY_LENGTH = 240

export const VIEW_BOX_WIDTH = 1000
export const VIEW_BOX_HEIGHT = 720
export const MAX_STROKE_COUNT = 64
export const MAX_POINTS_PER_STROKE = 900
export const MAX_TOTAL_POINTS = 20_000

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

/** A stroke is one flat [x, y, x, y, ...] run of pad coordinates, so an odd length is malformed. */
export type NormalizedStroke = number[]

export type StrokesValidation = { ok: true; value: NormalizedStroke[] } | { ok: false; reason: string }

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function roundCoordinate(value: number) {
  return Math.round(value * 10) / 10
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

/**
 * Clamps every point into the pad's view box and rounds it to one decimal, then rejects anything
 * over the stroke, point, or total-point budget. Runs on write and on read, because the strokes
 * column is JSON and nothing but this function guarantees its shape.
 */
export function normalizeStrokes(value: unknown): StrokesValidation {
  if (!Array.isArray(value)) {
    return { ok: false, reason: 'strokes must be a list' }
  }

  if (value.length > MAX_STROKE_COUNT) {
    return { ok: false, reason: `keep the drawing under ${MAX_STROKE_COUNT} strokes` }
  }

  const strokes: NormalizedStroke[] = []
  let totalPoints = 0

  for (const rawStroke of value) {
    if (!Array.isArray(rawStroke)) {
      return { ok: false, reason: 'every stroke must be a list of coordinates' }
    }

    if (rawStroke.length % 2 !== 0) {
      return { ok: false, reason: 'every stroke needs an even number of coordinates' }
    }

    const pointCount = rawStroke.length / 2

    if (pointCount === 0) continue

    if (pointCount > MAX_POINTS_PER_STROKE) {
      return { ok: false, reason: `keep each stroke under ${MAX_POINTS_PER_STROKE} points` }
    }

    totalPoints += pointCount

    if (totalPoints > MAX_TOTAL_POINTS) {
      return { ok: false, reason: `keep the drawing under ${MAX_TOTAL_POINTS.toLocaleString()} points` }
    }

    const stroke: NormalizedStroke = []

    for (let index = 0; index < rawStroke.length; index += 1) {
      const coordinate = rawStroke[index]

      if (typeof coordinate !== 'number' || !Number.isFinite(coordinate)) {
        return { ok: false, reason: 'every coordinate must be a finite number' }
      }

      const limit = index % 2 === 0 ? VIEW_BOX_WIDTH : VIEW_BOX_HEIGHT

      stroke.push(roundCoordinate(clamp(coordinate, 0, limit)))
    }

    strokes.push(stroke)
  }

  return { ok: true, value: strokes }
}
