import { describe, expect, it } from 'vitest'
import { getDateFromSlug } from '../app/timeline/post-dates'

describe('getDateFromSlug', () => {
  it('maps an M-D filename to its 2026 date', () => {
    expect(getDateFromSlug('8-31').date).toBe('2026-08-31')
    expect(getDateFromSlug('11-19').date).toBe('2026-11-19')
  })

  it('pins the semester bounds to 0 and 100', () => {
    expect(getDateFromSlug('8-17').timelinePosition).toBe(0)
    expect(getDateFromSlug('12-18').timelinePosition).toBe(100)
  })

  it('places posts proportionally rather than evenly', () => {
    const position = getDateFromSlug('9-7').timelinePosition

    expect(position).toBeGreaterThan(0)
    expect(position).toBeLessThan(25)
  })

  it('rejects filenames that are not M-D', () => {
    expect(() => getDateFromSlug('august-31')).toThrow(/Use M-D\.md/)
    expect(() => getDateFromSlug('2026-08-31')).toThrow(/Use M-D\.md/)
  })

  it('rejects dates outside the semester', () => {
    expect(() => getDateFromSlug('8-16')).toThrow(/8-17 through 12-18/)
    expect(() => getDateFromSlug('12-19')).toThrow(/8-17 through 12-18/)
  })

  it('rejects days that do not exist', () => {
    expect(() => getDateFromSlug('9-31')).toThrow(/8-17 through 12-18/)
  })
})
