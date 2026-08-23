import 'server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'

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
const timelineYear = 2026
const timelineStart = Date.UTC(timelineYear, 7, 17)
const timelineEnd = Date.UTC(timelineYear, 11, 18)

function getDateFromSlug(slug: string) {
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
