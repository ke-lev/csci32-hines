import { describe, expect, it } from 'vitest'
import { getNewFeatureSlugs, parseChangelogEntry } from '../app/changelog/entry-schema'

const valid = `---
title: admin tips inbox
kind: feature
features: admin, talk
---

tips submitted from the sitewide menu now land in an actionable inbox.
`

describe('changelog entry frontmatter', () => {
  it('takes the date and slug from the filename', () => {
    const entry = parseChangelogEntry(valid, '2026-09-11-admin-tips-inbox.md')

    expect(entry).toMatchObject({
      date: '2026-09-11',
      features: ['admin', 'talk'],
      kind: 'feature',
      slug: 'admin-tips-inbox',
      title: 'admin tips inbox',
    })
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
      parseChangelogEntry(valid, '2026-09-01-recent.md'),
      parseChangelogEntry(valid.replace('features: admin, talk', 'features: games'), '2026-01-01-old.md'),
    ]

    const slugs = getNewFeatureSlugs(entries, new Date('2026-09-11T00:00:00Z'))

    expect(slugs.has('admin')).toBe(true)
    expect(slugs.has('talk')).toBe(true)
    expect(slugs.has('games')).toBe(false)
  })
})
