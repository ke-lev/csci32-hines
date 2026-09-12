'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { loadHelpDocForPath, type HelpDocPayload } from './load-help-doc'

type HelpDocDialogProps = {
  onClose: () => void
  pathname: string
}

type DocState = { kind: 'loading' } | { kind: 'ready'; doc: HelpDocPayload } | { kind: 'error' }

export function HelpDocDialog({ onClose, pathname }: HelpDocDialogProps) {
  const [state, setState] = useState<DocState>({ kind: 'loading' })
  const dialogRef = useRef<HTMLDivElement>(null)

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

  // same containment the tips dialog uses: trap tab, close on escape, lock the page behind
  // it, and hand focus back to whatever opened it
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-5 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="help-doc-dialog-title"
        aria-modal="true"
        className="flex max-h-[calc(100svh-2.5rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[2rem] border border-line bg-background font-sans outline-none"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="relative shrink-0 border-b border-line px-6 pt-6 pb-6 sm:px-8 sm:pt-8">
          <p className="mb-6 font-mono text-[0.64rem] font-semibold tracking-[0.11em] text-foreground">
            about this page
          </p>
          <h2
            className="m-0 text-[clamp(2.2rem,7vw,3.2rem)] leading-[0.92] font-[520] tracking-[-0.06em] lowercase"
            id="help-doc-dialog-title"
          >
            {state.kind === 'ready' ? state.doc.title : 'help'}
          </h2>
          {state.kind === 'ready' ? (
            <p className="mt-4 mb-0 max-w-[46ch] text-[0.98rem] leading-[1.55] text-subhead text-balance">
              {state.doc.summary}
            </p>
          ) : null}
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
            <footer className="shrink-0 border-t border-line px-6 py-4 sm:px-8">
              <Link
                className="inline-flex min-h-7 items-center rounded-xs font-mono text-[0.72rem] tracking-[0.08em] text-muted lowercase transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
                href={`/help/${state.doc.slug}/`}
                onClick={onClose}
              >
                open the full page →
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
      </div>
    </div>
  )
}
