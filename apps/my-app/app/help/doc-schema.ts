import { parseFrontmatter } from '../lib/frontmatter'

export type HelpDoc = {
  admin: boolean
  content: string
  href: string
  route: string
  slug: string
  summary: string
  title: string
}

export const HOW_TO_USE_HEADING = '## how to use'

// SITE_ROUTES stores the homepage as an empty path, which cannot be written as a
// frontmatter value, so docs name it `home` instead.
export const HOME_ROUTE = 'home'

export function toHelpHref(route: string) {
  return route === HOME_ROUTE ? '/' : `/${route}/`
}

export function toRouteKey(route: string) {
  return route === HOME_ROUTE ? '' : route
}

export function parseHelpDoc(source: string, slug: string): HelpDoc {
  const frontmatter = parseFrontmatter(source)

  if (!frontmatter) {
    throw new Error(`${slug}.md is missing its frontmatter block`)
  }

  const { body, data } = frontmatter

  for (const field of ['title', 'route', 'summary'] as const) {
    if (!data[field]) {
      throw new Error(`${slug}.md is missing a ${field}`)
    }
  }

  const route = data.route
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()

  return {
    admin: data.admin === 'true',
    content: body,
    href: toHelpHref(route),
    route,
    slug,
    summary: data.summary,
    title: data.title,
  }
}

export function getPublicHelpDocs(docs: readonly HelpDoc[]) {
  return docs.filter((doc) => !doc.admin)
}
