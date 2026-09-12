import 'server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { parseChangelogEntry, sortChangelogEntries } from './entry-schema'

const entriesDirectory = path.join(process.cwd(), 'app', 'changelog', 'entries')

export async function getChangelogEntries() {
  const filenames = (await fs.readdir(entriesDirectory)).filter((filename) => filename.endsWith('.md'))
  const entries = await Promise.all(
    filenames.map(async (filename) => {
      const source = await fs.readFile(path.join(entriesDirectory, filename), 'utf8')
      return parseChangelogEntry(source, filename)
    }),
  )

  // newest first: the changelog is read from the top
  return sortChangelogEntries(entries)
}
