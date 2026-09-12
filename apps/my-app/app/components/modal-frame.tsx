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
