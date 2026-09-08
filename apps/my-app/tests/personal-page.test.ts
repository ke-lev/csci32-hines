import { describe, expect, it } from 'vitest'
import {
  MAX_INTRO_BODY_LENGTH,
  MAX_INTRO_SUBHEAD_LENGTH,
  MAX_INTRO_TITLE_LENGTH,
  normalizeIntroText,
  validateIntroInput,
} from '../app/lib/personal-page'
import {
  MAX_INTRO_BODY_LENGTH as BACKEND_MAX_BODY,
  MAX_INTRO_SUBHEAD_LENGTH as BACKEND_MAX_SUBHEAD,
  MAX_INTRO_TITLE_LENGTH as BACKEND_MAX_TITLE,
  validateIntroInput as validateIntroInputOnServer,
} from '../../backend/src/services/personal-page-validation'

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

describe('the backend agrees with the mirrored bounds', () => {
  it('shares every intro limit with the client copy', () => {
    expect({ body: BACKEND_MAX_BODY, subhead: BACKEND_MAX_SUBHEAD, title: BACKEND_MAX_TITLE }).toEqual({
      body: MAX_INTRO_BODY_LENGTH,
      subhead: MAX_INTRO_SUBHEAD_LENGTH,
      title: MAX_INTRO_TITLE_LENGTH,
    })
  })
})
