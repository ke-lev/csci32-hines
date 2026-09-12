import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHANGELOG_KINDS, parseChangelogEntry } from '../app/changelog/entry-schema'

const entriesDirectory = path.join(process.cwd(), 'app', 'changelog', 'entries')
const docsDirectory = path.join(process.cwd(), 'app', 'help', 'docs')

async function loadEntries() {
  const filenames = (await fs.readdir(entriesDirectory)).filter((filename) => filename.endsWith('.md'))

  return Promise.all(
    filenames.map(async (filename) =>
      parseChangelogEntry(await fs.readFile(path.join(entriesDirectory, filename), 'utf8'), filename),
    ),
  )
}

describe('changelog entries', () => {
  it('parses every entry on disk', async () => {
    const entries = await loadEntries()

    expect(entries.length).toBeGreaterThan(0)

    for (const entry of entries) {
      expect(CHANGELOG_KINDS).toContain(entry.kind)
      expect(entry.title.length, `${entry.slug} title`).toBeGreaterThan(0)
      expect(entry.content.length, `${entry.slug} body`).toBeGreaterThan(0)
      expect(entry.timestamp, `${entry.slug} timestamp`).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    }
  })

  // a dead "how to use" link is worse than no link, so the reference has to resolve
  it('only names features that have a help doc', async () => {
    const slugs = new Set(
      (await fs.readdir(docsDirectory))
        .filter((filename) => filename.endsWith('.md'))
        .map((filename) => filename.replace(/\.md$/, '')),
    )

    for (const entry of await loadEntries()) {
      for (const feature of entry.features) {
        expect(slugs, `${entry.slug} names "${feature}"`).toContain(feature)
      }
    }
  })
})
