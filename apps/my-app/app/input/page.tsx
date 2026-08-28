'use client'

import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { type FormEvent, useMemo, useState } from 'react'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { generateFace, normalizeFaceSeed } from './generate-face'
import { ProceduralFace } from './procedural-face'

type FaceName = {
  first: string
  last: string
}

const initialName: FaceName = {
  first: 'kaleb',
  last: 'hines',
}

export default function InputPage() {
  const [firstName, setFirstName] = useState(initialName.first)
  const [lastName, setLastName] = useState(initialName.last)
  const [faceName, setFaceName] = useState(initialName)
  const seed = useMemo(() => normalizeFaceSeed(faceName.first, faceName.last), [faceName])
  const face = useMemo(() => generateFace(seed), [seed])
  const displayName = `${faceName.first.trim()} ${faceName.last.trim()}`.replace(/\s+/g, ' ').trim()

  function drawFace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFaceName({ first: firstName, last: lastName })
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'input', href: '/input/' },
      ]}
      titleId="input-title"
      left={
        <PageIntro
          title="ugly faces"
          titleId="input-title"
          subhead="two names go in; one deterministic face comes out"
          body="same spelling, same checksum, same face - every line is drawn locally from the seed"
        >
          <form className="mt-9 max-w-[440px]" onSubmit={drawFace}>
            <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
              <label
                className="flex min-w-0 flex-col gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.04em] lowercase"
                htmlFor="first-name"
              >
                first name
                <Input
                  autoComplete="given-name"
                  className="w-full"
                  id="first-name"
                  maxLength={40}
                  name="firstName"
                  placeholder="first name"
                  required
                  setValue={setFirstName}
                  size={Size.MEDIUM}
                  value={firstName}
                  variant={Variant.SECONDARY}
                />
              </label>

              <label
                className="flex min-w-0 flex-col gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.04em] lowercase"
                htmlFor="last-name"
              >
                last name
                <Input
                  autoComplete="family-name"
                  className="w-full"
                  id="last-name"
                  maxLength={40}
                  name="lastName"
                  placeholder="last name"
                  required
                  setValue={setLastName}
                  size={Size.MEDIUM}
                  value={lastName}
                  variant={Variant.SECONDARY}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button type="submit" variant={Variant.PRIMARY}>
                draw face
              </Button>
              <p className="m-0 font-mono text-[0.64rem] tracking-[0.04em] text-muted lowercase">
                exact input → exact output
              </p>
            </div>
          </form>
        </PageIntro>
      }
      rightInset={false}
      right={
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden bg-background">
            <ProceduralFace config={face} key={face.checksum} name={displayName} />
          </div>
          <div
            aria-live="polite"
            className="flex items-center justify-between gap-4 border-t border-line px-[clamp(18px,2vw,28px)] py-4 font-mono text-[0.66rem] tracking-[0.06em] lowercase"
          >
            <p className="m-0 truncate text-foreground">{displayName}</p>
            <p className="m-0 shrink-0 text-muted">seed / {face.checksum}</p>
          </div>
        </div>
      }
    />
  )
}
