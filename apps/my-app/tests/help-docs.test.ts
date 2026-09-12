import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getPublicHelpDocs, HOW_TO_USE_HEADING, parseHelpDoc, toRouteKey } from '../app/help/doc-schema'
import { hasHelpDocForPath, SITE_ROUTES } from '../app/lib/site-routes'

const appDirectory = path.join(process.cwd(), 'app')
const docsDirectory = path.join(appDirectory, 'help', 'docs')

async function loadDocs() {
  const filenames = (await fs.readdir(docsDirectory)).filter((filename) => filename.endsWith('.md'))

  return Promise.all(
    filenames.map(async (filename) =>
      parseHelpDoc(await fs.readFile(path.join(docsDirectory, filename), 'utf8'), filename.replace(/\.md$/, '')),
    ),
  )
}

describe('help doc coverage', () => {
  // this is the whole point of the system: a page cannot ship without documentation,
  // because adding a route to the registry without a doc turns this suite red
  it('documents every route in the site registry', async () => {
    const documented = new Set((await loadDocs()).map((doc) => toRouteKey(doc.route)))
    const undocumented = SITE_ROUTES.filter((route) => !documented.has(route.path)).map((route) => route.command)

    expect(undocumented).toEqual([])
  })

  it('points every doc at a page that actually exists', async () => {
    const docs = await loadDocs()

    for (const doc of docs) {
      const pageFile =
        doc.route === 'home'
          ? path.join(appDirectory, 'page.tsx')
          : path.join(appDirectory, ...doc.route.split('/'), 'page.tsx')

      await expect(fs.access(pageFile), `${doc.slug}.md documents "${doc.route}"`).resolves.toBeUndefined()
    }
  })

  it('keeps slugs and routes unique so the index cannot show the same page twice', async () => {
    const docs = await loadDocs()

    expect(new Set(docs.map((doc) => doc.slug)).size).toBe(docs.length)
    expect(new Set(docs.map((doc) => doc.route)).size).toBe(docs.length)
  })

  it('gives every doc a summary and usage steps', async () => {
    for (const doc of await loadDocs()) {
      expect(doc.summary.length, `${doc.slug}.md summary`).toBeGreaterThan(0)
      expect(doc.content, `${doc.slug}.md`).toContain(HOW_TO_USE_HEADING)
    }
  })

  // the footer info button decides whether to render from hasHelpDocForPath alone, with no
  // filesystem access. if that gate ever says yes for a path nothing documents, the button
  // opens an empty modal — so tie the gate to the docs that actually exist on disk.
  it('only promises a doc for paths a doc actually covers', async () => {
    const documented = new Set((await loadDocs()).map((doc) => toRouteKey(doc.route)))

    for (const route of SITE_ROUTES) {
      expect(hasHelpDocForPath(route.href), `${route.href} gate`).toBe(true)
      expect(documented.has(route.path), `${route.href} doc`).toBe(true)
    }

    expect(hasHelpDocForPath('/admin/')).toBe(true)
    expect(documented.has('admin')).toBe(true)
  })

  // /admin is absent from the registry and noindex on purpose; its doc inherits that posture
  it('keeps admin docs out of the public index', async () => {
    const docs = await loadDocs()
    const publicSlugs = getPublicHelpDocs(docs).map((doc) => doc.slug)

    expect(docs.some((doc) => doc.admin)).toBe(true)
    expect(publicSlugs).not.toContain('admin')
  })
})
