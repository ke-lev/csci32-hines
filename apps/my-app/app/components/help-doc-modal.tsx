'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { hasHelpDocForPath } from '../lib/site-routes'

// the dialog pulls in the markdown renderer, which has no business in a route's bundle
// until someone actually asks what the page does
const HelpDocDialog = dynamic(() => import('./help-doc-dialog').then((module) => module.HelpDocDialog), {
  ssr: false,
})

export function HelpDocModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  // sub-pages like /help/<slug> and /timeline/<date> have no doc of their own, so they get
  // no button rather than a button that opens nothing
  if (!hasHelpDocForPath(pathname)) {
    return null
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label="about this page"
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line font-mono text-[0.8rem] leading-none font-[650] text-foreground lowercase transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
        onClick={() => setOpen(true)}
        title="about this page"
        type="button"
      >
        <span aria-hidden="true">i</span>
      </button>

      {open ? <HelpDocDialog onClose={close} pathname={pathname} /> : null}
    </>
  )
}
