'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

const terms = [
  'By interfacing with the Platform, you consent to all current, future, implied, deprecated, cross-functional, and strategically adjacent Terms, including any Terms subsequently recontextualized through policy harmonization, governance realignment, or stakeholder-driven optimization.',
  'Use of the Platform constitutes irrevocable acknowledgment of our right to ingest, normalize, enrich, operationalize, monetize, re-platform, deprecate, syndicate, federate, tokenize, abstract, and otherwise leverage all applicable data exhaust across the full-stack value chain.',
  'You agree not to disrupt platform integrity, commercial scalability, ecosystem velocity, revenue-adjacent workflows, trust architecture, engagement throughput, or any other KPI-bearing surface we may designate from time to time.',
  'All features are provided on an as-is, as-available, roadmap-contingent basis and may be throttled, sunsetted, paywalled, unbundled, rebundled, AI-enabled, vertically integrated, or strategically deprecated without creating any obligation, liability, or negative learnings on our part.',
  'Any disputes shall first undergo mandatory stakeholder alignment, executive escalation, asynchronous remediation, and a commercially reasonable period of mutual finger-pointing.',
  'Continued usage signifies acceptance of all Terms, including Terms you have not read, cannot locate, or that do not yet exist.',
]

export function TermsModal() {
  const [open, setOpen] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const frame = window.requestAnimationFrame(() => {
      const termsBody = termsRef.current
      if (termsBody && termsBody.scrollHeight <= termsBody.clientHeight + 1) {
        setHasReadTerms(true)
      }
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setHasReadTerms(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  function close() {
    setOpen(false)
    setHasReadTerms(false)
  }

  return (
    <>
      <Button
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        size={Size.MEDIUM}
        type="button"
        variant={Variant.TERTIARY}
      >
        terms of service
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-5 py-8 normal-case"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <div
            aria-describedby="terms-dialog-body"
            aria-labelledby="terms-dialog-title"
            aria-modal="true"
            className="terms-modal tips-view-enter flex max-h-[min(760px,calc(100svh-2.5rem))] w-full max-w-[640px] flex-col overflow-hidden rounded-[2rem] border border-line bg-background outline-none"
            onMouseDown={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <header className="relative shrink-0 border-b border-line px-6 py-6 sm:px-8 sm:py-8">
              <h2
                className="m-0 max-w-[12ch] text-[clamp(2.75rem,9vw,5rem)] leading-[0.9] font-[520] tracking-[-0.04em] lowercase text-balance"
                id="terms-dialog-title"
              >
                Terms of Service
              </h2>
              <button
                aria-label="close terms of service"
                className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line bg-background text-foreground transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent sm:top-7 sm:right-7 motion-reduce:transition-none"
                onClick={close}
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
                </svg>
              </button>
            </header>

            <div
              className="terms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-8 sm:py-8"
              id="terms-dialog-body"
              onScroll={(event) => {
                const body = event.currentTarget
                const reachedBottom = body.scrollHeight - body.scrollTop - body.clientHeight <= 2
                if (reachedBottom) setHasReadTerms(true)
              }}
              ref={termsRef}
              tabIndex={0}
            >
              <div className="flex max-w-[70ch] flex-col gap-[1.7em] text-[0.92rem] leading-[1.7] text-subhead sm:text-[0.98rem]">
                {terms.map((paragraph) => (
                  <p className="m-0" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <footer className="flex shrink-0 justify-end border-t border-line px-6 py-5 sm:px-8 sm:py-6">
              <Button
                className="disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
                disabled={!hasReadTerms}
                onClick={close}
                size={Size.MEDIUM}
                type="button"
                variant={hasReadTerms ? Variant.PRIMARY : Variant.SECONDARY}
              >
                wtf?
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
