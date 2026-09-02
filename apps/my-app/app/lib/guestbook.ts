import 'server-only'

import { prisma } from '@repo/database'
import type { DrawingKindName } from '../input/guestbook-name'

export const GUESTBOOK_PAGE_SIZE = 48

export type GuestbookEntryView = {
  entryId: string
  seed: string
  kind: DrawingKindName
  signedAt: string
}

export type GuestbookPage = {
  entries: GuestbookEntryView[]
  page: number
  pageCount: number
  total: number
}

/**
 * Records a signing. The unique (seed, kind) pair means a second submission of the same name
 * is a no-op rather than a duplicate row, so a double-click costs one query and nothing else.
 */
export async function signGuestbook(seed: string, kind: DrawingKindName) {
  await prisma.guestbookEntry.upsert({
    create: { kind, seed },
    update: {},
    where: { seed_kind: { kind, seed } },
  })
}

/** Reads one bounded page, newest first. The table is never read whole. */
export async function getGuestbookPage(requestedPage: number): Promise<GuestbookPage> {
  const total = await prisma.guestbookEntry.count()
  const pageCount = Math.max(1, Math.ceil(total / GUESTBOOK_PAGE_SIZE))
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), pageCount)

  const rows = await prisma.guestbookEntry.findMany({
    orderBy: [{ created_at: 'desc' }, { entry_id: 'desc' }],
    select: { created_at: true, entry_id: true, kind: true, seed: true },
    skip: (page - 1) * GUESTBOOK_PAGE_SIZE,
    take: GUESTBOOK_PAGE_SIZE,
  })

  return {
    entries: rows.map((row) => ({
      entryId: row.entry_id,
      kind: row.kind,
      seed: row.seed,
      signedAt: row.created_at.toISOString(),
    })),
    page,
    pageCount,
    total,
  }
}
