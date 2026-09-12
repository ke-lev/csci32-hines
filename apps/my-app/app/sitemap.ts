import type { MetadataRoute } from 'next'
import { getPublicHelpDocList } from './help/docs'
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
  '/welcome/',
  '/help/',
  '/changelog/',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, docs] = await Promise.all([getTimelinePosts(), getPublicHelpDocList()])
  const lastModified = new Date()

  return [
    ...publicRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified })),
    ...posts.map((post) => ({
      url: `${baseUrl}/timeline/${post.slug}/`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
    // the public list, so an admin doc cannot reach the sitemap by being added to the folder
    ...docs.map((doc) => ({ url: `${baseUrl}/help/${doc.slug}/`, lastModified })),
  ]
}
