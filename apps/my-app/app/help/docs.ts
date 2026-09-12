import 'server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { SITE_ROUTES } from '../lib/site-routes'
import { getPublicHelpDocs, HOME_ROUTE, parseHelpDoc, toRouteKey, type HelpDoc } from './doc-schema'

const appDirectory = path.join(process.cwd(), 'app')
const docsDirectory = path.join(appDirectory, 'help', 'docs')

// the help index orders features the way the /users shell already lists them, so there is
// no order field to keep in sync. pages outside the registry (sub-pages, admin) follow after.
const registryOrder = new Map<string, number>(SITE_ROUTES.map((route, index) => [route.path, index]))

function routeRank(doc: HelpDoc) {
  return registryOrder.get(toRouteKey(doc.route)) ?? Number.MAX_SAFE_INTEGER
}

// a doc that points at a page which does not exist is worse than no doc, so resolve the
// route against the real app directory and fail the build instead of rendering a dead link
async function assertRouteExists(doc: HelpDoc) {
  const pageFile =
    doc.route === HOME_ROUTE
      ? path.join(appDirectory, 'page.tsx')
      : path.join(appDirectory, ...doc.route.split('/'), 'page.tsx')

  try {
    await fs.access(pageFile)
  } catch {
    throw new Error(`${doc.slug}.md documents "${doc.route}", which has no page.tsx`)
  }
}

export async function getHelpDocs() {
  const filenames = (await fs.readdir(docsDirectory)).filter((filename) => filename.endsWith('.md'))
  const docs = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '')
      const source = await fs.readFile(path.join(docsDirectory, filename), 'utf8')
      const doc = parseHelpDoc(source, slug)
      await assertRouteExists(doc)

      return doc
    }),
  )

  return docs.sort((a, b) => routeRank(a) - routeRank(b) || a.title.localeCompare(b.title))
}

export async function getPublicHelpDocList() {
  return getPublicHelpDocs(await getHelpDocs())
}

export async function getHelpDoc(slug: string) {
  const docs = await getHelpDocs()
  return docs.find((doc) => doc.slug === slug)
}
