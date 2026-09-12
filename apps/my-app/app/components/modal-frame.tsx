'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { panelFrameSizeClasses } from './panel-frame'

type ModalFrameProps = {
  ariaDescribedBy?: string
  ariaLabelledBy: string
  children: ReactNode
  onClose: () => void
}

export const modalFooterControlClasses =
  'inline-flex min-h-7 cursor-pointer items-center rounded-xs border-0 bg-transparent p-0 font-mono text-[0.72rem] tracking-[0.08em] text-muted lowercase transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-footer disabled:hover:text-footer motion-reduce:transition-none'

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-6 py-4 sm:px-8">
      {children}
    </footer>
  )
}

export function ModalFrame({ ariaDescribedBy, ariaLabelledBy, children, onClose }: ModalFrameProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

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
        'button:not([disabled]), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
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
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-6 py-8 max-[560px]:px-5 max-[560px]:py-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
        className={`${panelFrameSizeClasses} flex max-h-[calc(100svh-4rem)] flex-col overflow-hidden rounded-[2rem] border border-line bg-background font-sans outline-none max-[560px]:max-h-[calc(100svh-2.5rem)]`}
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  )
}
