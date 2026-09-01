/**
 * Filename-to-date rules for timeline posts. Kept free of `server-only` and filesystem imports
 * so the validation that gates the build can be exercised directly.
 */
const timelineYear = 2026
const timelineStart = Date.UTC(timelineYear, 7, 17)
const timelineEnd = Date.UTC(timelineYear, 11, 18)

export function getDateFromSlug(slug: string) {
  const match = slug.match(/^(\d{1,2})-(\d{1,2})$/)

  if (!match) {
    throw new Error(`Invalid post filename "${slug}.md". Use M-D.md, for example 8-26.md.`)
  }

  const month = Number(match[1])
  const day = Number(match[2])
  const timestamp = Date.UTC(timelineYear, month - 1, day)
  const date = new Date(timestamp)
  const isRealDate = date.getUTCMonth() === month - 1 && date.getUTCDate() === day

  if (!isRealDate || timestamp < timelineStart || timestamp > timelineEnd) {
    throw new Error(`Post date "${slug}" must be a real date from 8-17 through 12-18, 2026.`)
  }

  return {
    date: date.toISOString().slice(0, 10),
    timelinePosition: ((timestamp - timelineStart) / (timelineEnd - timelineStart)) * 100,
  }
}
