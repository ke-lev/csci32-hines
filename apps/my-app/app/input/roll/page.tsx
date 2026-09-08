import type { Metadata } from 'next'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import Link from 'next/link'
import { Suspense } from 'react'
import { PageIntro } from '../../components/page-intro'
import { PageShell } from '../../components/page-shell'
import { getCachedGuestbookPage, type GuestbookPage } from '../../lib/guestbook'
import { RollSheet, RollSheetFallback } from './roll-sheet'

// the guestbook is read at request time. CI builds against a DATABASE_URL that does not
// connect, so this route must never be prerendered.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'roll',
  description: 'Everyone who has signed the guestbook, redrawn from their stored seed.',
  alternates: { canonical: '/input/roll/' },
}

const pageInfo = [
  '/input/roll',
  'each guestbook signature stores the normalized name seed, drawing kind, and signing time. this page reads the newest 48 entries at a time and uses the page query string to move through older batches.',
  '**redrawn, not stored:** there is no portrait image in the database. each face or cat is regenerated here from the saved seed using the same deterministic drawing code as /input, so the same signature always produces the same portrait.',
]

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  return Number.isFinite(parsed) ? parsed : 1
}

type GuestbookPagePromise = Promise<GuestbookPage>

async function RollAttendance({ guestbookPage }: { guestbookPage: GuestbookPagePromise }) {
  const { total } = await guestbookPage

  return (
    <p className="mt-5 font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">
      {total === 1 ? '1 signature is on the sheet' : `${total} signatures are on the sheet`}
    </p>
  )
}

async function RollPagination({ guestbookPage }: { guestbookPage: GuestbookPagePromise }) {
  const { page, pageCount } = await guestbookPage

  if (pageCount <= 1) return null

  return (
    <span className="flex items-center gap-4 font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">
      {page > 1 ? (
        <Link
          className="underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          href={`/input/roll/?page=${page - 1}`}
        >
          newer
        </Link>
      ) : null}
      <span>
        page {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          className="underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          href={`/input/roll/?page=${page + 1}`}
        >
          older
        </Link>
      ) : null}
    </span>
  )
}

async function RollPortraits({ guestbookPage }: { guestbookPage: GuestbookPagePromise }) {
  const { entries } = await guestbookPage

  return <RollSheet entries={entries} />
}

export default async function RollPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const requestedPage = parsePage((await searchParams).page)
  const guestbookPage = getCachedGuestbookPage(requestedPage)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'input', href: '/input/' },
        { label: 'roll', href: '/input/roll/' },
      ]}
      info={pageInfo}
      titleId="roll-title"
      left={
        <PageIntro
          body={'time for a class photo!'}
          subhead="thanks for showing up"
          title="roll call"
          titleId="roll-title"
        >
          <Suspense
            fallback={
              <p
                aria-label="loading"
                className="mt-5 font-mono text-[0.68rem] tracking-[0.06em] text-muted"
                role="status"
              >
                <span aria-hidden="true">...</span>
              </p>
            }
          >
            <RollAttendance guestbookPage={guestbookPage} />
          </Suspense>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="/input/" size={Size.MEDIUM} variant={Variant.PRIMARY}>
              add another signature
            </Button>
            <Suspense fallback={null}>
              <RollPagination guestbookPage={guestbookPage} />
            </Suspense>
          </div>
        </PageIntro>
      }
      rightInset={false}
      right={
        <Suspense fallback={<RollSheetFallback />}>
          <RollPortraits guestbookPage={guestbookPage} />
        </Suspense>
      }
    />
  )
}
