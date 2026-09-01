import { getRandomInt } from '@repo/math/getRandomInt'
import { describe, expect, it } from 'vitest'

describe('getRandomInt', () => {
  it('stays inside the inclusive range', () => {
    for (let attempt = 0; attempt < 500; attempt += 1) {
      const value = getRandomInt(3, 7)

      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThanOrEqual(7)
    }
  })

  it('can return either endpoint', () => {
    const seen = new Set<number>()

    for (let attempt = 0; attempt < 500; attempt += 1) {
      seen.add(getRandomInt(0, 1))
    }

    expect(seen).toEqual(new Set([0, 1]))
  })

  it('returns the only legal value when the bounds match', () => {
    expect(getRandomInt(4, 4)).toBe(4)
  })

  it('rejects reversed bounds', () => {
    expect(() => getRandomInt(9, 2)).toThrow(RangeError)
  })

  it('rejects non-finite bounds', () => {
    expect(() => getRandomInt(0, Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })
})
