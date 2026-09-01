'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

// the dialog carries the editor and the QR; neither belongs in every route's bundle
const TipsDialog = dynamic(() => import('./tips-modal-body').then((module) => module.TipsDialog), { ssr: false })

export function TipsModal() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <Button
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        size={Size.MEDIUM}
        type="button"
        variant={Variant.PRIMARY}
      >
        tips?
      </Button>

      {open ? <TipsDialog onClose={close} /> : null}
    </>
  )
}
