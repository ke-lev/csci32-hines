import { describe, expect, it } from 'vitest'
import {
  fromStoredStrokes,
  MAX_INTRO_BODY_LENGTH,
  MAX_INTRO_SUBHEAD_LENGTH,
  MAX_INTRO_TITLE_LENGTH,
  MAX_POINTS_PER_STROKE,
  MAX_STROKE_COUNT,
  MAX_TOTAL_POINTS,
  normalizeIntroText,
  storedStrokesMatch,
  toStoredStrokes,
  validateIntroInput,
  type DrawingStroke,
} from '../app/lib/personal-page'
import {
  MAX_INTRO_BODY_LENGTH as BACKEND_MAX_BODY,
  MAX_INTRO_SUBHEAD_LENGTH as BACKEND_MAX_SUBHEAD,
  MAX_INTRO_TITLE_LENGTH as BACKEND_MAX_TITLE,
  MAX_POINTS_PER_STROKE as BACKEND_MAX_POINTS_PER_STROKE,
  MAX_STROKE_COUNT as BACKEND_MAX_STROKE_COUNT,
  MAX_TOTAL_POINTS as BACKEND_MAX_TOTAL_POINTS,
  normalizeStrokes,
  validateIntroInput as validateIntroInputOnServer,
} from '../../backend/src/services/personal-page-validation'

function strokeOfLength(length: number): DrawingStroke {
  return Array.from({ length }, (_, index) => ({ x: index % 1000, y: index % 720 }))
}

describe('intro validation', () => {
  it('accepts intro copy the backend also accepts', () => {
    const intro = { introBody: ' a short note ', introSubhead: ' a subhead ', introTitle: 'sup\nkelev' }

    expect(validateIntroInput(intro)).toEqual({})
    expect(validateIntroInputOnServer(intro)).toEqual({
      ok: true,
      value: { introBody: 'a short note', introSubhead: 'a subhead', introTitle: 'sup\nkelev' },
    })
  })

  it('requires a title and a subhead', () => {
    expect(validateIntroInput({ introBody: '', introSubhead: '   ', introTitle: '' })).toEqual({
      introSubhead: 'add a subhead',
      introTitle: 'add a title',
    })
  })

  it('reports each field over its own bound', () => {
    expect(
      validateIntroInput({
        introBody: 'b'.repeat(MAX_INTRO_BODY_LENGTH + 1),
        introSubhead: 's'.repeat(MAX_INTRO_SUBHEAD_LENGTH + 1),
        introTitle: 't'.repeat(MAX_INTRO_TITLE_LENGTH + 1),
      }),
    ).toEqual({
      introBody: `keep the note under ${MAX_INTRO_BODY_LENGTH} characters`,
      introSubhead: `keep the subhead under ${MAX_INTRO_SUBHEAD_LENGTH} characters`,
      introTitle: `keep the title under ${MAX_INTRO_TITLE_LENGTH} characters`,
    })
  })

  it('keeps newlines in the title but flattens them in the subhead', () => {
    expect(normalizeIntroText('sup\r\nkelev', { allowNewlines: true })).toBe('sup\nkelev')
    expect(normalizeIntroText('one\ntwo', { allowNewlines: false })).toBe('one two')
  })

  it('strips control characters without eating tabs', () => {
    const withControlCharacter = `a${String.fromCharCode(1)}b\tc`

    expect(normalizeIntroText(withControlCharacter, { allowNewlines: true })).toBe('ab\tc')
  })
})

describe('stroke storage', () => {
  it('round trips a drawing through the stored shape', () => {
    const stored = toStoredStrokes([
      [
        { x: 10.04, y: 20.06 },
        { x: 30, y: 40 },
      ],
    ])

    expect(stored).toEqual([[10, 20.1, 30, 40]])
    expect(fromStoredStrokes(stored)).toEqual([
      [
        { x: 10, y: 20.1 },
        { x: 30, y: 40 },
      ],
    ])
  })

  it('clamps points to the pad view box', () => {
    expect(toStoredStrokes([[{ x: -50, y: 5000 }]])).toEqual([[0, 720]])
  })

  it('drops strokes past the stroke cap', () => {
    const strokes = Array.from({ length: MAX_STROKE_COUNT + 5 }, () => strokeOfLength(2))

    expect(toStoredStrokes(strokes)).toHaveLength(MAX_STROKE_COUNT)
  })

  it('trims a stroke past the per-stroke point cap', () => {
    const stored = toStoredStrokes([strokeOfLength(MAX_POINTS_PER_STROKE + 100)])

    expect(stored[0]).toHaveLength(MAX_POINTS_PER_STROKE * 2)
  })

  it('stops at the total point budget', () => {
    const strokes = Array.from({ length: MAX_STROKE_COUNT }, () => strokeOfLength(MAX_POINTS_PER_STROKE))
    const totalPoints = toStoredStrokes(strokes).reduce((total, stroke) => total + stroke.length / 2, 0)

    expect(totalPoints).toBe(MAX_TOTAL_POINTS)
  })

  it('skips a trailing coordinate with no pair', () => {
    expect(fromStoredStrokes([[1, 2, 3]])).toEqual([[{ x: 1, y: 2 }]])
  })

  it('compares stored drawings by value', () => {
    expect(storedStrokesMatch([[1, 2]], [[1, 2]])).toBe(true)
    expect(storedStrokesMatch([[1, 2]], [[1, 3]])).toBe(false)
    expect(storedStrokesMatch([[1, 2]], [])).toBe(false)
  })
})

describe('the backend agrees with the mirrored bounds', () => {
  it('shares every limit with the client copy', () => {
    expect({
      body: BACKEND_MAX_BODY,
      pointsPerStroke: BACKEND_MAX_POINTS_PER_STROKE,
      strokeCount: BACKEND_MAX_STROKE_COUNT,
      subhead: BACKEND_MAX_SUBHEAD,
      title: BACKEND_MAX_TITLE,
      totalPoints: BACKEND_MAX_TOTAL_POINTS,
    }).toEqual({
      body: MAX_INTRO_BODY_LENGTH,
      pointsPerStroke: MAX_POINTS_PER_STROKE,
      strokeCount: MAX_STROKE_COUNT,
      subhead: MAX_INTRO_SUBHEAD_LENGTH,
      title: MAX_INTRO_TITLE_LENGTH,
      totalPoints: MAX_TOTAL_POINTS,
    })
  })

  it('accepts a full-budget drawing from the client unchanged', () => {
    const stored = toStoredStrokes(
      Array.from({ length: MAX_STROKE_COUNT }, () => strokeOfLength(MAX_POINTS_PER_STROKE)),
    )

    expect(normalizeStrokes(stored)).toEqual({ ok: true, value: stored })
  })

  it('rejects drawings the client would never build', () => {
    expect(normalizeStrokes('not a list')).toEqual({ ok: false, reason: 'strokes must be a list' })
    expect(normalizeStrokes([[1, 2, 3]])).toEqual({
      ok: false,
      reason: 'every stroke needs an even number of coordinates',
    })
    expect(normalizeStrokes([[1, Number.NaN]])).toEqual({
      ok: false,
      reason: 'every coordinate must be a finite number',
    })
    expect(normalizeStrokes(Array.from({ length: MAX_STROKE_COUNT + 1 }, () => [1, 2]))).toEqual({
      ok: false,
      reason: `keep the drawing under ${MAX_STROKE_COUNT} strokes`,
    })
  })

  it('clamps out-of-range coordinates instead of trusting them', () => {
    expect(normalizeStrokes([[-10, 9999]])).toEqual({ ok: true, value: [[0, 720]] })
  })
})
