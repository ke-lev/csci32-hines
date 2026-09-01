import { describe, expect, it } from 'vitest'
import { normalizeFaceSeed } from '../app/input/generate-face'
import { generateSingleLineFace } from '../app/input/generate-single-line-face'

describe('normalizeFaceSeed', () => {
  it('collapses case and stray whitespace', () => {
    expect(normalizeFaceSeed('  Ada ', ' Lovelace  ')).toBe('ada lovelace')
    expect(normalizeFaceSeed('ADA', 'LOVELACE')).toBe('ada lovelace')
  })

  it('keeps a missing last name from leaving a trailing space', () => {
    expect(normalizeFaceSeed('larry', '')).toBe('larry')
  })
})

describe('generateSingleLineFace', () => {
  it('summons the same creature for the same name', () => {
    expect(generateSingleLineFace('ada lovelace')).toEqual(generateSingleLineFace('ada lovelace'))
  })

  it('summons a different creature for a different name', () => {
    expect(generateSingleLineFace('ada lovelace').checksum).not.toBe(generateSingleLineFace('grace hopper').checksum)
  })

  it('falls back to a stable seed for an empty name', () => {
    expect(generateSingleLineFace('').seed).toBe('anonymous visitor')
  })

  it('keeps every landmark inside the drawing viewbox', () => {
    const { landmarks } = generateSingleLineFace('ada lovelace')
    const coordinates = JSON.stringify(landmarks).match(/-?\d+(\.\d+)?/g) ?? []

    for (const coordinate of coordinates) {
      expect(Number(coordinate)).toBeGreaterThanOrEqual(0)
      expect(Number(coordinate)).toBeLessThanOrEqual(100)
    }
  })
})
