import { parseFrontmatter } from '../lib/frontmatter'

export const CHANGELOG_KINDS = ['feature', 'improvement', 'fix'] as const

export type ChangelogKind = (typeof CHANGELOG_KINDS)[number]

export type ChangelogEntry = {
  content: string
  date: string
  features: string[]
  kind: ChangelogKind
  slug: string
  timestamp: string
  timestampLabel: string
  title: string
}

// a feature stops advertising itself this long after the entry that introduced it,
// so the badge expires on its own instead of waiting for someone to delete a flag
export const NEW_FEATURE_WINDOW_DAYS = 30

const filenamePattern = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
const changelogTimeZone = 'America/New_York'

function assertRealDate(date: string, filename: string) {
  // Date accepts 2026-02-30 and rolls it forward, so compare the round trip
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename} is not a real date`)
  }
}

function getDateInChangelogTimeZone(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: changelogTimeZone,
    year: 'numeric',
  }).formatToParts(value)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value

  return `${part('year')}-${part('month')}-${part('day')}`
}

export function parseChangelogEntry(source: string, filename: string): ChangelogEntry {
  const name = filenamePattern.exec(filename)

  if (!name) {
    throw new Error(`${filename} must be named YYYY-MM-DD-slug.md`)
  }

  const [, date, slug] = name
  assertRealDate(date, filename)

  const frontmatter = parseFrontmatter(source)

  if (!frontmatter) {
    throw new Error(`${filename} is missing its frontmatter block`)
  }

  const { body, data } = frontmatter

  if (!data.title) {
    throw new Error(`${filename} is missing a title`)
  }

  const timestamp = data.timestamp
  const timestampDate = new Date(timestamp)

  if (
    !timestamp ||
    !timestampPattern.test(timestamp) ||
    Number.isNaN(timestampDate.getTime()) ||
    timestampDate.toISOString().replace('.000Z', 'Z') !== timestamp
  ) {
    throw new Error(`${filename} needs a valid UTC timestamp like 2026-09-12T23:16:43Z`)
  }

  if (getDateInChangelogTimeZone(timestampDate) !== date) {
    throw new Error(`${filename} date must match its timestamp`)
  }

  const kind = data.kind as ChangelogKind

  if (!CHANGELOG_KINDS.includes(kind)) {
    throw new Error(`${filename} needs a kind of ${CHANGELOG_KINDS.join(', ')}`)
  }

  return {
    content: body,
    date,
    features: (data.features ?? '')
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean),
    kind,
    slug,
    timestamp,
    timestampLabel: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      timeZone: changelogTimeZone,
      timeZoneName: 'short',
      year: 'numeric',
    }).format(timestampDate),
    title: data.title,
  }
}

export function sortChangelogEntries(entries: ChangelogEntry[]) {
  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || a.slug.localeCompare(b.slug),
  )
}

export function getNewFeatureSlugs(entries: readonly ChangelogEntry[], today: Date) {
  const cutoff = new Date(today)
  cutoff.setUTCDate(cutoff.getUTCDate() - NEW_FEATURE_WINDOW_DAYS)
  const cutoffDate = cutoff.toISOString().slice(0, 10)

  return new Set(entries.filter((entry) => entry.date >= cutoffDate).flatMap((entry) => entry.features))
}
