import type { Metadata } from 'next'
import { TimelineArchive } from './timeline-archive'
import { getClosestTimelinePost } from './closest-post'
import { getTimelinePosts } from './posts'

// the only request-time input is "which post is closest to today", so rebuild daily instead of per request
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'timeline',
  description: 'Notes, experiments, and small updates from the build.',
  alternates: { canonical: '/timeline/' },
}

export default async function TimelinePage() {
  const posts = await getTimelinePosts()
  const selectedPost = getClosestTimelinePost(posts, new Date())

  if (!selectedPost) {
    throw new Error('No timeline posts found')
  }

  return <TimelineArchive posts={posts} selectedPost={selectedPost} />
}
