'use server'

import { getTimelinePost } from './posts'

const timelineSlug = /^\d{1,2}-\d{1,2}$/

export type ReadTimelinePostResult =
  | {
      ok: true
      post: {
        content: string
        dateLabel: string
        description: string
        title: string
      }
    }
  | { ok: false; reason: string }

export async function readTimelinePost(slug: string): Promise<ReadTimelinePostResult> {
  const normalizedSlug = slug.trim().replace(/\.md$/, '')

  if (!timelineSlug.test(normalizedSlug)) {
    return { ok: false, reason: 'timeline posts use M-D slugs' }
  }

  const post = await getTimelinePost(normalizedSlug)
  if (!post) return { ok: false, reason: 'no post exists for that slug' }

  return {
    ok: true,
    post: {
      content: post.content,
      dateLabel: post.dateLabel,
      description: post.description,
      title: post.title,
    },
  }
}
