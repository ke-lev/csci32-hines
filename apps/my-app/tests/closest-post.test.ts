import { describe, expect, it } from 'vitest'
import { getClosestTimelinePost } from '../app/timeline/closest-post'

const posts = [{ date: '2026-08-17' }, { date: '2026-08-31' }, { date: '2026-12-18' }]

describe('getClosestTimelinePost', () => {
  it('picks the post landing on the access date', () => {
    expect(getClosestTimelinePost(posts, new Date('2026-08-31T12:00:00Z'))?.date).toBe('2026-08-31')
  })

  it('picks the nearest post when the date falls between entries', () => {
    expect(getClosestTimelinePost(posts, new Date('2026-08-20T00:00:00Z'))?.date).toBe('2026-08-17')
    expect(getClosestTimelinePost(posts, new Date('2026-08-29T00:00:00Z'))?.date).toBe('2026-08-31')
  })

  it('settles on the last post long after the semester ends', () => {
    expect(getClosestTimelinePost(posts, new Date('2027-03-01T00:00:00Z'))?.date).toBe('2026-12-18')
  })

  it('returns nothing when there are no posts', () => {
    expect(getClosestTimelinePost([], new Date())).toBeUndefined()
  })
})
