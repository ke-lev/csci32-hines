'use client'

import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import Link from 'next/link'
import { type FormEvent, useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { normalizeFaceSeed } from './generate-face'
import { generateSingleLineFace } from './generate-single-line-face'
import { signGuestbookAction } from './sign-guestbook'
import { SingleLineCat } from './single-line-cat'
import { SingleLineFace } from './single-line-face'

type DrawingName = {
  first: string
  last: string
}

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
)

const initialName: DrawingName = {
  first: 'john',
  last: 'doe',
}

const luckyNames = [
  'anna graham',
  'sandy beach',
  'mr denmark',
  'earl grey',
  'goopu loopu',
  'foo bar',
  'admin mcadminface',
  'karl marx',
  'rene descartes',
  'friedrich nietzche',
  'big chungus',
  "beans n'rice",
  'lorem ipsum',
  'jimothy',
  'buck naked',
  'shirley temple',
  'bat man',
  'stoopoo doopoo',
  'larry',
  'ivana tinkle',
  'oopy goopy',
  'seymour butts',
  'al dente',
  'general munchkinman',
  'tj cream',
  'lil jimbob',
  'bing bong',
  'peepee poopoo',
  'barrack obama',
  'donald trump',
  'joe biden',
  'george bush',
  'bill clinton',
  'dub step',
  'terry aki',
  'anita break',
  'ben dover',
  'stan still',
  'gub gub',
  'justin case',
  'norma lee',
  'perry winkle',
  'glubtubbus wepple',
  'deez nuts',
  'walter melon',
  'this guy',
  'six seven',
  'cali fornia',
  'penny wise',
  'aura borealis',
  'baby punch',
  'paige turner',
]

function pickRandom(items: readonly string[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0] ?? ''
}

function splitLuckyName(fullName: string): DrawingName {
  const firstSpace = fullName.indexOf(' ')

  if (firstSpace === -1) return { first: fullName, last: '' }

  return {
    first: fullName.slice(0, firstSpace),
    last: fullName.slice(firstSpace + 1),
  }
}

export function NameDrawingPage() {
  const drawingSvgRef = useRef<SVGSVGElement>(null)
  const [firstName, setFirstName] = useState(initialName.first)
  const [lastName, setLastName] = useState(initialName.last)
  const [drawingName, setDrawingName] = useState(initialName)
  const [drawRevision, setDrawRevision] = useState(0)
  const [catMode, setCatMode] = useState(false)
  const drawingSeed = useMemo(() => normalizeFaceSeed(drawingName.first, drawingName.last), [drawingName])
  const currentSeed = useMemo(() => normalizeFaceSeed(firstName, lastName), [firstName, lastName])
  const face = useMemo(() => generateSingleLineFace(drawingSeed), [drawingSeed])
  const drawingKind = catMode ? 'cat' : 'face'
  const drawingDisplayName = drawingSeed || 'anonymous visitor'
  const displayName = currentSeed || 'anonymous visitor'
  const [isSigning, setIsSigning] = useState(false)
  const [signedKey, setSignedKey] = useState<string | null>(null)
  const [signError, setSignError] = useState<{ key: string; reason: string } | null>(null)
  // The footer and signing state follow the fields live, so they always describe what the
  // guestbook button will publish rather than the last name that happened to be drawn.
  const signatureKey = `${currentSeed}:${drawingKind}`
  const isSigned = signedKey === signatureKey
  const failureReason = signError?.key === signatureKey ? signError.reason : null

  function getName(): DrawingName {
    return { first: firstName, last: lastName }
  }

  function drawName(name: DrawingName = getName()) {
    setDrawingName(name)
    setDrawRevision((revision) => revision + 1)
  }

  async function signTheGuestbook() {
    if (isSigning || isSigned) return

    const name = getName()
    const signingKey = `${normalizeFaceSeed(name.first, name.last)}:${drawingKind}`

    drawName(name)
    setIsSigning(true)
    setSignError(null)

    const result = await signGuestbookAction(name.first, name.last, drawingKind)

    setIsSigning(false)

    if (result.ok) {
      if (isPostHogConfigured) posthog.capture('guestbook_signed', { drawing_kind: drawingKind })
      setSignedKey(`${result.seed}:${drawingKind}`)
      return
    }

    setSignError({ key: signingKey, reason: result.reason })
  }

  function draw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    drawName()
    if (isPostHogConfigured) posthog.capture('portrait_drawn', { drawing_kind: drawingKind })
  }

  function fillLuckyName() {
    const luckyName = splitLuckyName(pickRandom(luckyNames))

    setFirstName(luckyName.first)
    setLastName(luckyName.last)
    drawName(luckyName)
  }

  function toggleCatMode() {
    drawName()
    setCatMode((isCatMode) => !isCatMode)
  }

  function downloadDrawing() {
    const source = drawingSvgRef.current

    if (!source) return

    const exportedSvg = source.cloneNode(true) as SVGSVGElement
    const rootStyles = window.getComputedStyle(document.documentElement)
    const backgroundColor = rootStyles.getPropertyValue('--ui-background').trim()
    const foregroundColor = rootStyles.getPropertyValue('--ui-foreground').trim()
    exportedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    exportedSvg.setAttribute('width', '1024')
    exportedSvg.setAttribute('height', '1024')
    exportedSvg.removeAttribute('class')
    exportedSvg.removeAttribute('style')

    exportedSvg.querySelectorAll('[class], [style]').forEach((element) => {
      element.removeAttribute('class')
      element.removeAttribute('style')
    })

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    background.setAttribute('width', '100')
    background.setAttribute('height', '100')
    background.setAttribute('fill', backgroundColor)
    const drawingPath = exportedSvg.querySelector('path')
    drawingPath?.setAttribute('stroke', foregroundColor)
    drawingPath?.before(background)

    const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(exportedSvg)}`
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.download = `one-line-${drawingKind}-${face.checksum}.svg`
    link.href = downloadUrl
    document.body.appendChild(link)
    link.click()
    link.remove()
    if (isPostHogConfigured) posthog.capture('portrait_downloaded', { drawing_kind: drawingKind })
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
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
          body={
            '- same name == same drawing\n- cat-mode remixes the portrait as a cat face lol\n- you can download the svg\n- you can now sign the guestbook'
          }
          subhead="like one of your french girls"
          title="draw me"
          titleId="input-title"
        >
          <form className="mt-8 max-w-[440px]" onSubmit={draw}>
            <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
              <label
                className="flex min-w-0 flex-col gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.04em] lowercase"
                htmlFor="input-first-name"
              >
                first name
                <Input
                  autoComplete="given-name"
                  className="w-full"
                  id="input-first-name"
                  maxLength={40}
                  name="firstName"
                  placeCaretAtEndOnEdgeClick
                  required
                  setValue={setFirstName}
                  size={Size.MEDIUM}
                  value={firstName}
                  variant={Variant.SECONDARY}
                />
              </label>

              <label
                className="flex min-w-0 flex-col gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.04em] lowercase"
                htmlFor="input-last-name"
              >
                last name
                <Input
                  autoComplete="family-name"
                  className="w-full"
                  id="input-last-name"
                  maxLength={40}
                  name="lastName"
                  placeCaretAtEndOnEdgeClick
                  setValue={setLastName}
                  size={Size.MEDIUM}
                  value={lastName}
                  variant={Variant.SECONDARY}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button type="submit" variant={Variant.PRIMARY}>
                draw me!
              </Button>
              <Button onClick={fillLuckyName} type="button" variant={Variant.SECONDARY}>
                i’m feeling lucky
              </Button>
              <Button
                className={
                  catMode
                    ? 'border-success bg-success text-background hover:border-success hover:bg-success'
                    : undefined
                }
                onClick={toggleCatMode}
                size={Size.MEDIUM}
                type="button"
                variant={catMode ? Variant.PRIMARY : Variant.SECONDARY}
              >
                cat-mode
              </Button>
            </div>
          </form>
        </PageIntro>
      }
      rightInset={false}
      right={
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
            {catMode ? (
              <SingleLineCat
                config={face}
                key={`${face.checksum}-cat-${drawRevision}`}
                name={drawingDisplayName}
                svgRef={drawingSvgRef}
              />
            ) : (
              <SingleLineFace
                config={face}
                key={`${face.checksum}-${drawRevision}`}
                name={drawingDisplayName}
                svgRef={drawingSvgRef}
              />
            )}
            <button
              aria-label={`Download this ${drawingKind} as SVG`}
              className="group absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-line bg-background text-foreground transition duration-300 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
              onClick={downloadDrawing}
              type="button"
            >
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
                <line
                  className="transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                  x1="10"
                  x2="10"
                  y1="3"
                  y2="12.5"
                />
                <polyline
                  className="transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
                  points="5.75 9 10 13.25 14.25 9"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <polyline
                  points="4 13.5 4 16.5 16 16.5 16 13.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </div>
          <div
            aria-live="polite"
            className="flex items-center justify-between gap-4 border-t border-line px-[clamp(18px,2vw,28px)] py-4 font-mono text-[0.66rem] tracking-[0.06em] lowercase"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-foreground">
                {failureReason ? <span className="text-muted">{failureReason}</span> : displayName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                className="text-muted underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                href="/input/roll/"
              >
                see the roll
              </Link>
              <Button
                disabled={isSigning || isSigned}
                onClick={signTheGuestbook}
                size={Size.MEDIUM}
                type="button"
                variant={isSigned ? Variant.SECONDARY : Variant.PRIMARY}
              >
                {isSigned ? 'signed \u2713' : isSigning ? 'signing\u2026' : 'sign the guestbook'}
              </Button>
            </div>
          </div>
        </div>
      }
    />
  )
}
