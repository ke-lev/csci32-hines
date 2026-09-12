import 'server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { SITE_ROUTES } from '../lib/site-routes'
import { getPublicHelpDocs, parseHelpDoc, toRouteKey, type HelpDoc } from './doc-schema'

// next.config.ts traces this directory into every route's bundle: the info modal's server
// action runs on whatever page the reader is on, not just the ones that render a doc
const docsDirectory = path.join(process.cwd(), 'app', 'help', 'docs')

// the help index orders features the way the /users shell already lists them, so there is
// no order field to keep in sync. pages outside the registry (sub-pages, admin) follow after.
const registryOrder = new Map<string, number>(SITE_ROUTES.map((route, index) => [route.path, index]))

function routeRank(doc: HelpDoc) {
  return registryOrder.get(toRouteKey(doc.route)) ?? Number.MAX_SAFE_INTEGER
}

export async function getHelpDocs() {
  const filenames = (await fs.readdir(docsDirectory)).filter((filename) => filename.endsWith('.md'))
  const docs = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '')
      const source = await fs.readFile(path.join(docsDirectory, filename), 'utf8')

      return parseHelpDoc(source, slug)
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
