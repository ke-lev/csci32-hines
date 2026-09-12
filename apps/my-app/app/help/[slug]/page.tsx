import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { PageShell } from '../../components/page-shell'
import { getHelpDoc, getHelpDocs } from '../docs'

type HelpDocPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const docs = await getHelpDocs()
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: HelpDocPageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = await getHelpDoc(slug)

  if (!doc) {
    return {}
  }

  return {
    title: `${doc.title} — help`,
    description: doc.summary,
    alternates: { canonical: `/help/${doc.slug}/` },
    // admin docs stay unlisted, the same posture the admin console itself takes
    ...(doc.admin ? { robots: { follow: false, index: false } } : {}),
  }
}

export default async function HelpDocPage({ params }: HelpDocPageProps) {
  const { slug } = await params
  const doc = await getHelpDoc(slug)

  if (!doc) {
    notFound()
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'help', href: '/help/' },
        { label: doc.slug, href: `/help/${doc.slug}/` },
      ]}
      titleId="help-doc-title"
      left={
        <div className="w-full self-center">
          <h1
            className="page-intro-title m-0 max-w-[580px] text-[clamp(3.4rem,7vw,7rem)] leading-[0.86] font-[520] tracking-[-0.078em] max-[900px]:text-[clamp(3.2rem,12vw,6rem)] max-[560px]:text-[clamp(2.9rem,15vw,4.6rem)]"
            id="help-doc-title"
          >
            {doc.title}
          </h1>
          <p className="page-intro-description mt-8 max-w-[46ch] text-[clamp(1.05rem,1.4vw,1.3rem)] leading-[1.55] text-subhead text-balance">
            {doc.summary}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[0.72rem] tracking-[0.08em] lowercase">
            <Link
              className="inline-flex min-h-7 items-center rounded-xs text-muted transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              href="/help/"
            >
              ← all features
            </Link>
            <Link
              className="inline-flex min-h-7 items-center rounded-xs text-muted transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              href={doc.href}
            >
              open {doc.route === 'home' ? '/' : `/${doc.route}`} →
            </Link>
          </div>
        </div>
      }
      right={
        <article
          className="doc-prose doc-scroll h-full overflow-y-auto px-[clamp(14px,2vw,26px)] py-[clamp(18px,2.4vw,34px)]"
          aria-label={`${doc.title} documentation`}
        >
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </article>
      }
    />
  )
}
