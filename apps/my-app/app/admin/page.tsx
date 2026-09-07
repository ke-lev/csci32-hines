import type { Metadata } from 'next'
import { getTimelinePosts } from '../timeline/posts'
import { AdminConsole } from './admin-console'

export const metadata: Metadata = {
  title: 'admin console',
  description: "here's the real stats, chief",
  robots: { follow: false, index: false },
}

export default async function AdminPage() {
  const posts = await getTimelinePosts()

  return (
    <AdminConsole
      posts={posts.map(({ dateLabel, slug, title }) => ({ dateLabel, slug, title }))}
    />
  )
}
