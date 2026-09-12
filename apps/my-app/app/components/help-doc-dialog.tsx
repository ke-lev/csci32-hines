'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { loadHelpDocForPath, type HelpDocPayload } from './load-help-doc'
import { ModalFrame } from './modal-frame'

const footerLinkClasses =
  'inline-flex min-h-7 items-center rounded-xs font-mono text-[0.72rem] tracking-[0.08em] text-muted lowercase transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none'

type HelpDocDialogProps = {
  onClose: () => void
  pathname: string
}

type DocState = { kind: 'loading' } | { kind: 'ready'; doc: HelpDocPayload } | { kind: 'error' }

export function HelpDocDialog({ onClose, pathname }: HelpDocDialogProps) {
  const [state, setState] = useState<DocState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false

    loadHelpDocForPath(pathname)
      .then((doc) => {
        if (cancelled) return
        setState(doc ? { kind: 'ready', doc } : { kind: 'error' })
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <ModalFrame ariaLabelledBy="help-doc-dialog-title" onClose={onClose}>
      <header className="relative shrink-0 border-b border-line px-6 pt-5 pb-5 sm:px-8 sm:pt-6">
        <p className="mb-4 font-mono text-[0.64rem] font-semibold tracking-[0.11em] text-foreground">about this page</p>
        <h2
          className="m-0 text-[clamp(1.9rem,6vw,2.6rem)] leading-[0.95] font-[520] tracking-[-0.05em] lowercase"
          id="help-doc-dialog-title"
        >
          {state.kind === 'ready' ? state.doc.title : 'help'}
        </h2>
        <button
          aria-label="close"
          className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line text-foreground transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
          onClick={onClose}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
          </svg>
        </button>
      </header>

      {state.kind === 'ready' ? (
        <>
          <article
            aria-label={`${state.doc.title} documentation`}
            className="doc-prose doc-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8"
          >
            <ReactMarkdown>{state.doc.content}</ReactMarkdown>
          </article>
          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-6 py-4 sm:px-8">
            <Link className={footerLinkClasses} href="/changelog/" onClick={onClose}>
              changelog
            </Link>
            <Link className={footerLinkClasses} href={`/help/${state.doc.slug}/`} onClick={onClose}>
              open the full help doc →
            </Link>
          </footer>
        </>
      ) : (
        <p
          aria-live="polite"
          className="m-0 px-6 py-10 text-center font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase sm:px-8"
          role="status"
        >
          {state.kind === 'loading' ? '...' : 'could not load that doc'}
        </p>
      )}
    </ModalFrame>
  )
}
