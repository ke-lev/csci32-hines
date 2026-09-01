import 'server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getDateFromSlug } from './post-dates'

export type TimelinePost = {
  content: string
  date: string
  dateLabel: string
  description: string
  slug: string
  timelineDateLabel: string
  timelinePosition: number
  title: string
}

const postsDirectory = path.join(process.cwd(), 'app', 'timeline', 'posts')

function parseFrontmatter(source: string, slug: string): TimelinePost {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    throw new Error(`Missing frontmatter in ${slug}.md`)
  }

  const metadata = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':')
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )

  if (!metadata.title || !metadata.description) {
    throw new Error(`Invalid frontmatter in ${slug}.md`)
  }

  const { date, timelinePosition } = getDateFromSlug(slug)

  return {
    content: match[2].trim(),
    date,
    dateLabel: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'UTC',
      year: '2-digit',
    }).format(new Date(`${date}T00:00:00Z`)),
    description: metadata.description,
    slug,
    timelineDateLabel: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`)),
    timelinePosition,
    title: metadata.title,
  }
}

export async function getTimelinePosts() {
  const filenames = (await fs.readdir(postsDirectory)).filter((filename) => filename.endsWith('.md'))
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '')
      const source = await fs.readFile(path.join(postsDirectory, filename), 'utf8')
      return parseFrontmatter(source, slug)
    }),
  )

  return posts.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTimelinePost(slug: string) {
  const posts = await getTimelinePosts()
  return posts.find((post) => post.slug === slug)
}
