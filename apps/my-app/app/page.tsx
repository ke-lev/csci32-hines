'use client'

import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import Link from 'next/link'
import { useState } from 'react'
import { PageIntro } from './components/page-intro'
import { PageShell } from './components/page-shell'
import { NowPlaying } from './components/now-playing'

const links = [
  {
    href: '/buttons/',
    label: '/buttons',
    description: 'i heard you like buttons, so i put some buttons in your buttons so you can button while you button',
  },
  {
    href: '/input/',
    label: '/input',
    description: 'three inputs, three buttons, and three aggressively native browser alerts',
  },
  {
    href: '#',
    label: 'dummy link three',
    description: 'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
]

export default function Home() {
  const [thursdayAnswer, setThursdayAnswer] = useState<string | null>(null)
  const [hasReset, setHasReset] = useState(false)

  function checkThursday() {
    setThursdayAnswer(new Date().getDay() === 4 ? 'yes, it is' : 'no, it is not')
  }

  function resetThursday() {
    setThursdayAnswer(null)
    setHasReset(true)
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
      ]}
      titleId="hero-title"
      left={
        <div className="home-intro-frame flex h-[var(--panel-h)] min-w-0 flex-col max-[900px]:h-auto">
          <div className="shrink-0">
            <PageIntro
              title={
                <>
                  <span className="block">wuddup</span>
                  <span className="block translate-x-2">my dudes?</span>
                </>
              }
              titleId="hero-title"
              subhead="welcome home. click around and find out"
            >
              <div className="mt-[22px] flex items-center gap-2.5">
                <Button href="/timeline/" size={Size.LARGE} variant={Variant.SECONDARY}>
                  timeline
                </Button>
                <Button
                  size={Size.LARGE}
                  variant={thursdayAnswer ? Variant.SECONDARY : Variant.PRIMARY}
                  onClick={checkThursday}
                >
                  {thursdayAnswer ?? (hasReset ? 'is it thursday yet?' : 'is it thursday?')}
                </Button>
                {thursdayAnswer && (
                  <Button size={Size.LARGE} onClick={resetThursday}>
                    ok
                  </Button>
                )}
              </div>
            </PageIntro>
          </div>
          <div className="mt-auto pt-6 max-[900px]:mt-8 max-[900px]:pt-0">
            <NowPlaying />
          </div>
        </div>
      }
      right={
        <nav className="flex min-h-0 flex-1 flex-col" aria-label="homepage links">
          {links.map((link) => (
            <Link
              className="group flex min-h-22 flex-1 flex-col items-end justify-center gap-3.5 border-b border-line px-[clamp(18px,2vw,28px)] py-6 transition-colors duration-180 last:border-b-0 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#8ec5ff] motion-reduce:transition-none"
              href={link.href}
              key={link.label}
            >
              <span className="inline-flex rounded-full bg-foreground px-[15px] py-2.5 font-mono text-[0.72rem] leading-none font-[650] tracking-[0.02em] text-background transition-transform duration-180 group-hover:-translate-x-1 group-focus-visible:-translate-x-1 motion-reduce:transition-none">
                {link.label}
              </span>
              <span className="max-w-[42ch] text-right text-[0.88rem] leading-6 text-muted">{link.description}</span>
            </Link>
          ))}
        </nav>
      }
    />
  )
}
