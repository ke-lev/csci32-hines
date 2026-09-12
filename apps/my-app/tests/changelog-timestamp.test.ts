import { describe, expect, it } from 'vitest'
import { formatChangelogTimestamp } from '../app/changelog/changelog-timestamp'

describe('changelog timestamp formatting', () => {
  const timestamp = '2026-09-12T23:43:59Z'

  it('formats the same instant in the viewer timezone', () => {
    expect(formatChangelogTimestamp(timestamp, 'America/Los_Angeles')).toContain('Sep 12, 2026, 4:43 PM')
    expect(formatChangelogTimestamp(timestamp, 'Asia/Tokyo')).toContain('Sep 13, 2026, 8:43 AM')
  })
})
