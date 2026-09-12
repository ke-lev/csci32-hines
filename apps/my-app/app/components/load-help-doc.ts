'use server'

import { toRouteKey } from '../help/doc-schema'
import { getHelpDocs } from '../help/docs'
import { hasHelpDocForPath, normalizeRoutePath } from '../lib/site-routes'

export type HelpDocPayload = {
  content: string
  slug: string
  summary: string
  title: string
}

/**
 * The info button already knows a doc exists before it calls this, but the check runs again
 * here: the argument arrives from the client, and reading the docs directory off an
 * unchecked string is not something to hand out.
 */
export async function loadHelpDocForPath(pathname: string): Promise<HelpDocPayload | null> {
  if (!hasHelpDocForPath(pathname)) {
    return null
  }

  const normalized = normalizeRoutePath(pathname)
  const doc = (await getHelpDocs()).find((candidate) => toRouteKey(candidate.route) === normalized)

  if (!doc) {
    return null
  }

  return { content: doc.content, slug: doc.slug, summary: doc.summary, title: doc.title }
}
