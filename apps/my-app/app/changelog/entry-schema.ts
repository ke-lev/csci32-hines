import { parseFrontmatter } from '../lib/frontmatter'

export const CHANGELOG_KINDS = ['feature', 'improvement', 'fix'] as const

export type ChangelogKind = (typeof CHANGELOG_KINDS)[number]

export type ChangelogEntry = {
  content: string
  date: string
  dateLabel: string
  features: string[]
  kind: ChangelogKind
  slug: string
  title: string
}

// a feature stops advertising itself this long after the entry that introduced it,
// so the badge expires on its own instead of waiting for someone to delete a flag
export const NEW_FEATURE_WINDOW_DAYS = 30

const filenamePattern = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/

function assertRealDate(date: string, filename: string) {
  // Date accepts 2026-02-30 and rolls it forward, so compare the round trip
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename} is not a real date`)
  }
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

  const kind = data.kind as ChangelogKind

  if (!CHANGELOG_KINDS.includes(kind)) {
    throw new Error(`${filename} needs a kind of ${CHANGELOG_KINDS.join(', ')}`)
  }

  return {
    content: body,
    date,
    dateLabel: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`)),
    features: (data.features ?? '')
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean),
    kind,
    slug,
    title: data.title,
  }
}

export function getNewFeatureSlugs(entries: readonly ChangelogEntry[], today: Date) {
  const cutoff = new Date(today)
  cutoff.setUTCDate(cutoff.getUTCDate() - NEW_FEATURE_WINDOW_DAYS)
  const cutoffDate = cutoff.toISOString().slice(0, 10)

  return new Set(entries.filter((entry) => entry.date >= cutoffDate).flatMap((entry) => entry.features))
}
