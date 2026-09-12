import type { Metadata } from 'next'
import Link from 'next/link'
import { getChangelogEntries } from '../changelog/entries'
import { getNewFeatureSlugs } from '../changelog/entry-schema'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { getPublicHelpDocList } from './docs'

// the only request-time input is whether a feature still counts as new, so rebuild daily
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'help',
  description: 'What every page on the site does, and how to use it.',
  alternates: { canonical: '/help/' },
}

export default async function HelpPage() {
  const [docs, entries] = await Promise.all([getPublicHelpDocList(), getChangelogEntries()])
  const newSlugs = getNewFeatureSlugs(entries, new Date())

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'help', href: '/help/' },
      ]}
      titleId="help-title"
      left={
        <PageIntro
          title="how it works"
          titleId="help-title"
          subhead="every page on this site, explained by the page itself"
          body="a test fails the build if any route ends up without a doc, so this list cannot quietly fall behind"
        />
      }
      right={
        <nav className="doc-scroll flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Features">
          {docs.map((doc) => (
            <Link
              className="group flex flex-col gap-2 border-b border-line px-[clamp(18px,2vw,28px)] py-5 transition-colors duration-180 last:border-b-0 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
              href={`/help/${doc.slug}/`}
              key={doc.slug}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-[0.88rem] leading-6 text-foreground">{doc.title}</span>
                {newSlugs.has(doc.slug) ? (
                  <span className="inline-flex rounded-full bg-accent px-2 py-[3px] font-mono text-[0.6rem] leading-none font-[650] tracking-[0.08em] text-background">
                    new
                  </span>
                ) : null}
              </span>
              <span className="max-w-[46ch] text-[0.84rem] leading-6 text-muted">{doc.summary}</span>
            </Link>
          ))}
        </nav>
      }
    />
  )
}
