'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

// the write-up is only of interest to whoever asks for it; keep the dialog out of the route bundle
const InfoDialog = dynamic(() => import('./info-modal-body').then((module) => module.InfoDialog), { ssr: false })

type InfoModalProps = {
  paragraphs: string[]
}

export function InfoModal({ paragraphs }: InfoModalProps) {
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
        how it works
      </Button>

      {open ? <InfoDialog onClose={close} paragraphs={paragraphs} /> : null}
    </>
  )
}
