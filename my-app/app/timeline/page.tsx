import type { Metadata } from 'next'
import { connection } from 'next/server'
import { TimelineArchive } from './timeline-archive'
import { getClosestTimelinePost, getTimelinePosts } from './posts'

export const metadata: Metadata = {
  title: "timeline | git'n init",
  description: 'Notes, experiments, and small updates from the build.',
}

export default async function TimelinePage() {
  await connection()

  const posts = await getTimelinePosts()
  const selectedPost = getClosestTimelinePost(posts, new Date())

  if (!selectedPost) {
    throw new Error('No timeline posts found')
  }

  return <TimelineArchive posts={posts} selectedPost={selectedPost} />
}
