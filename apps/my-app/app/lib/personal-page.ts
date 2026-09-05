// Mirrors apps/backend/src/services/personal-page-validation.ts. The backend is the trust
// boundary; these copies keep the pad and the intro form from offering work the server refuses.

export const MAX_INTRO_TITLE_LENGTH = 80
export const MAX_INTRO_SUBHEAD_LENGTH = 140
export const MAX_INTRO_BODY_LENGTH = 240

export const VIEW_BOX_WIDTH = 1000
export const VIEW_BOX_HEIGHT = 720
export const MAX_STROKE_COUNT = 64
export const MAX_POINTS_PER_STROKE = 900
export const MAX_TOTAL_POINTS = 20_000

export type DrawingPoint = {
  x: number
  y: number
}

export type DrawingStroke = DrawingPoint[]

/** One flat [x, y, x, y, ...] array per stroke - the shape stored in PersonalPage.strokes. */
export type StoredStroke = number[]

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function roundCoordinate(value: number) {
  return Math.round(value * 10) / 10
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

/** Flattens pad strokes into the stored shape, dropping empties and clamping to the view box. */
export function toStoredStrokes(strokes: DrawingStroke[]): StoredStroke[] {
  const stored: StoredStroke[] = []
  let totalPoints = 0

  for (const stroke of strokes) {
    if (stored.length >= MAX_STROKE_COUNT) break
    if (!stroke.length) continue

    const points = stroke.slice(0, Math.min(MAX_POINTS_PER_STROKE, MAX_TOTAL_POINTS - totalPoints))

    if (!points.length) break

    totalPoints += points.length

    const flattened: StoredStroke = []

    for (const point of points) {
      flattened.push(
        roundCoordinate(clamp(point.x, 0, VIEW_BOX_WIDTH)),
        roundCoordinate(clamp(point.y, 0, VIEW_BOX_HEIGHT)),
      )
    }

    stored.push(flattened)
  }

  return stored
}

/** Rebuilds pad strokes from the stored shape, skipping anything malformed rather than throwing. */
export function fromStoredStrokes(stored: readonly StoredStroke[]): DrawingStroke[] {
  const strokes: DrawingStroke[] = []

  for (const flattened of stored) {
    const stroke: DrawingStroke = []

    for (let index = 0; index + 1 < flattened.length; index += 2) {
      const x = flattened[index]
      const y = flattened[index + 1]

      if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) continue

      stroke.push({ x: clamp(x, 0, VIEW_BOX_WIDTH), y: clamp(y, 0, VIEW_BOX_HEIGHT) })
    }

    if (stroke.length) strokes.push(stroke)
  }

  return strokes
}

export function countPoints(strokes: DrawingStroke[]) {
  return strokes.reduce((total, stroke) => total + stroke.length, 0)
}

export function storedStrokesMatch(left: readonly StoredStroke[], right: readonly StoredStroke[]) {
  if (left.length !== right.length) return false

  return left.every((stroke, strokeIndex) => {
    const other = right[strokeIndex]

    return Boolean(other) && stroke.length === other?.length && stroke.every((value, index) => value === other[index])
  })
}
