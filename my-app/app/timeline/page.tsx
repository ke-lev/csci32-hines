import type { Metadata } from 'next'
import { TimelineArchive } from './timeline-archive'
import { getTimelinePosts } from './posts'

export const metadata: Metadata = {
  title: "timeline | git'n init",
  description: 'Notes, experiments, and small updates from the build.',
}

export default async function TimelinePage() {
  const posts = await getTimelinePosts()
  const selectedPost = posts.at(-1)

  if (!selectedPost) {
    throw new Error('No timeline posts found')
  }

  return <TimelineArchive posts={posts} selectedPost={selectedPost} />
}
