import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { getPublicHelpDocList } from '../help/docs'
import { getChangelogEntries } from './entries'

export const metadata: Metadata = {
  title: 'changelog',
  description: 'What shipped on the site, newest first.',
  alternates: { canonical: '/changelog/' },
}

const kindClassName: Record<string, string> = {
  feature: 'border-accent text-accent',
  improvement: 'border-line text-foreground',
  fix: 'border-line text-muted',
}

export default async function ChangelogPage() {
  const [entries, docs] = await Promise.all([getChangelogEntries(), getPublicHelpDocList()])
  const publicSlugs = new Set(docs.map((doc) => doc.slug))

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'changelog', href: '/changelog/' },
      ]}
      titleId="changelog-title"
      left={
        <PageIntro
          title={'what\nshipped'}
          titleId="changelog-title"
          subhead="features, improvements, and fixes — newest first"
          body="refactors, dependency bumps, and infrastructure work are deliberately left out. this is only what changed for whoever is using the site"
        />
      }
      right={
        <div className="doc-scroll min-h-0 flex-1 overflow-y-auto" aria-label="Changelog entries">
          {entries.map((entry) => (
            <article
              className="border-b border-line px-[clamp(18px,2vw,28px)] py-6 last:border-b-0"
              key={`${entry.date}-${entry.slug}`}
            >
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-[0.68rem] tracking-[0.08em] lowercase">
                <time className="text-muted" dateTime={entry.date}>
                  {entry.dateLabel}
                </time>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-[3px] leading-none font-[650] ${kindClassName[entry.kind]}`}
                >
                  {entry.kind}
                </span>
              </div>

              <h2 className="mt-3 text-[0.95rem] leading-6 font-[550] text-foreground">{entry.title}</h2>

              <div className="doc-prose mt-2">
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              </div>

              {entry.features.filter((feature) => publicSlugs.has(feature)).length > 0 ? (
                <nav className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Related help">
                  {entry.features
                    .filter((feature) => publicSlugs.has(feature))
                    .map((feature) => (
                      <Link
                        className="inline-flex min-h-7 items-center rounded-xs font-mono text-[0.68rem] tracking-[0.08em] text-muted lowercase transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
                        href={`/help/${feature}/`}
                        key={feature}
                      >
                        how to use {feature} →
                      </Link>
                    ))}
                </nav>
              ) : null}
            </article>
          ))}
        </div>
      }
    />
  )
}
