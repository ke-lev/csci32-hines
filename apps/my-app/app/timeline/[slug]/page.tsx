import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TimelineArchive } from '../timeline-archive'
import { getTimelinePost, getTimelinePosts } from '../posts'

type TimelinePostPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await getTimelinePosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: TimelinePostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getTimelinePost(slug)

  return post
    ? {
        title: `${post.title} | kelev`,
        description: post.description,
      }
    : {}
}

export default async function TimelinePostPage({ params }: TimelinePostPageProps) {
  const { slug } = await params
  const [posts, selectedPost] = await Promise.all([getTimelinePosts(), getTimelinePost(slug)])

  if (!selectedPost) {
    notFound()
  }

  return <TimelineArchive posts={posts} selectedPost={selectedPost} />
}
