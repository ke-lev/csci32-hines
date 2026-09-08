'use client'

import { useRef } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { useDialog } from './use-dialog'

type InfoDialogProps = {
  onClose: () => void
  paragraphs: string[]
}

// the copy is prose, so pages hand over plain strings rather than a wall of hand-wrapped jsx. the
// only markup any of them has wanted so far is a bold lead-in, which **double asterisks** cover.
function withLeadIn(paragraph: string) {
  return paragraph.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <strong className="font-semibold" key={`${index}-${part}`}>
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

export function InfoDialog({ onClose, paragraphs }: InfoDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialog(dialogRef, onClose)
  const routeLabel = paragraphs[0]?.match(/^\/[a-z0-9/-]*$/) ? paragraphs[0] : null
  const prose = routeLabel ? paragraphs.slice(1) : paragraphs

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-5 py-8 normal-case"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-describedby="info-dialog-body"
        aria-labelledby="info-dialog-title"
        aria-modal="true"
        className="tips-view-enter flex max-h-[min(760px,calc(100svh-2.5rem))] w-full max-w-[640px] flex-col overflow-hidden rounded-[2rem] border border-line bg-background font-sans outline-none"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="relative shrink-0 border-b border-line px-6 py-6 sm:px-8 sm:py-8">
          <h2
            className="m-0 max-w-[12ch] text-[clamp(2.25rem,7vw,4rem)] leading-[0.9] font-[520] tracking-[-0.04em] lowercase text-balance"
            id="info-dialog-title"
          >
            how it works
          </h2>
          <button
            aria-label="close how it works"
            className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line bg-background text-foreground transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent sm:top-7 sm:right-7 motion-reduce:transition-none"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
            </svg>
          </button>
        </header>

        <div
          className="dialog-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-8 sm:py-8"
          id="info-dialog-body"
          tabIndex={0}
        >
          <div className="flex max-w-[70ch] flex-col gap-[1.5em] text-[0.92rem] leading-[1.7] text-foreground sm:text-[0.98rem]">
            {routeLabel ? (
              <p className="m-0 font-mono text-[0.64rem] tracking-[0.12em] text-muted lowercase">{routeLabel}</p>
            ) : null}
            {prose.map((paragraph) => (
              <p className="m-0" key={paragraph}>
                {withLeadIn(paragraph)}
              </p>
            ))}
          </div>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-line px-6 py-5 sm:px-8 sm:py-6">
          <Button onClick={onClose} size={Size.MEDIUM} type="button" variant={Variant.PRIMARY}>
            neat
          </Button>
        </footer>
      </div>
    </div>
  )
}
