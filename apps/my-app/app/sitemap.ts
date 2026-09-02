import type { MetadataRoute } from 'next'
import { getTimelinePosts } from './timeline/posts'

const baseUrl = 'https://csci32-hines.vercel.app'

// /admin is deliberately absent; it is noindex and only reachable through the shell
const publicRoutes = [
  '/',
  '/buttons/',
  '/input/',
  '/games/',
  '/games/random-number-guesser/',
  '/games/game-of-life/',
  '/input/roll/',
  '/timeline/',
  '/users/',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getTimelinePosts()
  const lastModified = new Date()

  return [
    ...publicRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified })),
    ...posts.map((post) => ({
      url: `${baseUrl}/timeline/${post.slug}/`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
  ]
}
