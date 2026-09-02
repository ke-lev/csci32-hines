import type { Metadata } from 'next'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import Link from 'next/link'
import { PageIntro } from '../../components/page-intro'
import { PageShell } from '../../components/page-shell'
import { getGuestbookPage } from '../../lib/guestbook'
import { RollSheet } from './roll-sheet'

// the guestbook is read at request time. CI builds against a DATABASE_URL that does not
// connect, so this route must never be prerendered.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'roll',
  description: 'Everyone who has signed the guestbook, redrawn from their stored seed.',
  alternates: { canonical: '/input/roll/' },
}

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  return Number.isFinite(parsed) ? parsed : 1
}

export default async function RollPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { entries, page, pageCount, total } = await getGuestbookPage(parsePage((await searchParams).page))

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'input', href: '/input/' },
        { label: 'roll', href: '/input/roll/' },
      ]}
      titleId="roll-title"
      left={
        <PageIntro
          body={
            'ok so basically the name you entered gets hashed and added to a database and it actually just get regenerated here whenever you load the page (no need to store the svg or anything). it keeps track of whether or not you are a cat, and it refuses duped entries'
          }
          subhead="thanks for showing up"
          title="roll call"
          titleId="roll-title"
        >
          <p className="mt-5 font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">
            {total === 1 ? '1 person is present' : `${total} people are present`}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="/input/" size={Size.MEDIUM} variant={Variant.PRIMARY}>
              add another person
            </Button>
            {pageCount > 1 ? (
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
            ) : null}
          </div>
        </PageIntro>
      }
      rightInset={false}
      right={<RollSheet entries={entries} />}
    />
  )
}
