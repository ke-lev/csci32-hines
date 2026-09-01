'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

// the terms are a long, self-contained joke; keep them out of every route's bundle until asked for
const TermsDialog = dynamic(() => import('./terms-modal-body').then((module) => module.TermsDialog), { ssr: false })

export function TermsModal() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <Button
        aria-haspopup="dialog"
        className="text-muted hover:text-foreground focus-visible:text-foreground"
        onClick={() => setOpen(true)}
        size={Size.MEDIUM}
        type="button"
        variant={Variant.TERTIARY}
      >
        terms of service
      </Button>

      {open ? <TermsDialog onClose={close} /> : null}
    </>
  )
}
