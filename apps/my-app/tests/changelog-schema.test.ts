import { describe, expect, it } from 'vitest'
import { getNewFeatureSlugs, parseChangelogEntry, sortChangelogEntries } from '../app/changelog/entry-schema'

const valid = `---
title: admin tips inbox
kind: feature
features: admin, talk
timestamp: 2026-09-11T20:15:30Z
---

tips submitted from the sitewide menu now land in an actionable inbox.
`

describe('changelog entry frontmatter', () => {
  it('takes the date and slug from the filename and the timestamp from frontmatter', () => {
    const entry = parseChangelogEntry(valid, '2026-09-11-admin-tips-inbox.md')

    expect(entry).toMatchObject({
      date: '2026-09-11',
      features: ['admin', 'talk'],
      kind: 'feature',
      slug: 'admin-tips-inbox',
      timestamp: '2026-09-11T20:15:30Z',
      timestampLabel: 'Sep 11, 2026, 4:15 PM EDT',
      title: 'admin tips inbox',
    })
  })

  it('requires a real canonical UTC timestamp on the filename date', () => {
    expect(() => parseChangelogEntry(valid.replace(/timestamp:.*\n/, ''), '2026-09-11-x.md')).toThrow(
      /valid UTC timestamp/,
    )
    expect(() =>
      parseChangelogEntry(valid.replace('20:15:30Z', '20:15Z'), '2026-09-11-x.md'),
    ).toThrow(/valid UTC timestamp/)
    expect(() =>
      parseChangelogEntry(valid.replace('2026-09-11T20:15:30Z', '2026-02-30T20:15:30Z'), '2026-09-11-x.md'),
    ).toThrow(/valid UTC timestamp/)
    expect(() =>
      parseChangelogEntry(valid.replace('2026-09-11T20:15:30Z', '2026-13-11T20:15:30Z'), '2026-09-11-x.md'),
    ).toThrow(/valid UTC timestamp/)
    expect(() =>
      parseChangelogEntry(valid.replace('2026-09-11T20:15:30Z', '2026-09-12T20:15:30Z'), '2026-09-11-x.md'),
    ).toThrow(/date must match/)
    expect(() =>
      parseChangelogEntry(valid.replace('20:15:30Z', '00:15:30Z'), '2026-09-11-x.md'),
    ).toThrow(/date must match/)
  })

  it('sorts same-day entries by timestamp descending with a stable slug tie-breaker', () => {
    const older = parseChangelogEntry(valid.replace('20:15:30Z', '09:00:00Z'), '2026-09-11-z-older.md')
    const newest = parseChangelogEntry(valid.replace('20:15:30Z', '21:00:00Z'), '2026-09-11-a-newest.md')
    const tiedFirst = parseChangelogEntry(valid.replace('20:15:30Z', '12:00:00Z'), '2026-09-11-a-tied.md')
    const tiedSecond = parseChangelogEntry(valid.replace('20:15:30Z', '12:00:00Z'), '2026-09-11-b-tied.md')

    expect(sortChangelogEntries([older, tiedSecond, newest, tiedFirst]).map((entry) => entry.slug)).toEqual([
      'a-newest',
      'a-tied',
      'b-tied',
      'z-older',
    ])
  })

  it('refuses a filename that is not a real date', () => {
    expect(() => parseChangelogEntry(valid, 'admin-tips.md')).toThrow(/YYYY-MM-DD/)
    expect(() => parseChangelogEntry(valid, '2026-02-30-nope.md')).toThrow(/not a real date/)
  })

  it('refuses a kind outside the three the table allows', () => {
    expect(() => parseChangelogEntry(valid.replace('kind: feature', 'kind: chore'), '2026-09-11-x.md')).toThrow(
      /feature, improvement, fix/,
    )
  })

  it('treats a feature as new only inside the window, so the badge expires itself', () => {
    const entries = [
      parseChangelogEntry(valid.replace('2026-09-11T20:15:30Z', '2026-09-01T20:15:30Z'), '2026-09-01-recent.md'),
      parseChangelogEntry(
        valid.replace('features: admin, talk', 'features: games').replace('2026-09-11T20:15:30Z', '2026-01-01T20:15:30Z'),
        '2026-01-01-old.md',
      ),
    ]

    const slugs = getNewFeatureSlugs(entries, new Date('2026-09-11T00:00:00Z'))

    expect(slugs.has('admin')).toBe(true)
    expect(slugs.has('talk')).toBe(true)
    expect(slugs.has('games')).toBe(false)
  })
})
