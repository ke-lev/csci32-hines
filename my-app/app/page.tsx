'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageIntro } from './components/page-intro'
import { PageShell } from './components/page-shell'

const links = [
  {
    href: '/buttons/',
    label: '/buttons',
    description: 'i heard you like buttons, so i put some buttons in your buttons so you can button while you button',
  },
  {
    href: '#',
    label: 'dummy link two',
    description: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    href: '#',
    label: 'dummy link three',
    description: 'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
]

const thursdayButton =
  'cursor-pointer rounded-full border border-foreground px-[18px] py-[11px] font-mono text-[0.72rem] leading-none font-semibold tracking-[0.04em] lowercase transition-transform duration-180 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0'

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
        { label: 'Users', href: '/' },
        { label: 'kelev', href: '/' },
      ]}
      titleId="hero-title"
      left={
        <PageIntro
          title={
            <>
              <span className="block">wuddup</span>
              <span className="block translate-x-2">my dudes?</span>
            </>
          }
          titleId="hero-title"
          subhead="wecome home, if you wanna know if it's thursday, click the button below"
        >
          <div className="mt-[22px] flex items-center gap-2.5">
            <button
              className={`${thursdayButton} ${
                thursdayAnswer ? 'bg-background text-foreground' : 'bg-foreground text-background'
              }`}
              type="button"
              onClick={checkThursday}
            >
              {thursdayAnswer ?? (hasReset ? 'is it thursday yet?' : 'is it thursday?')}
            </button>
            {thursdayAnswer && (
              <button
                className={`${thursdayButton} min-w-12 bg-foreground text-background`}
                type="button"
                onClick={resetThursday}
              >
                ok
              </button>
            )}
          </div>
        </PageIntro>
      }
      right={
        <nav className="flex flex-1 flex-col" aria-label="dummy links">
          {links.map((link) => (
            <Link
              className="group flex min-h-22 flex-1 flex-col items-end justify-center gap-3.5 border-b border-line px-[clamp(18px,2vw,28px)] py-6 transition-colors duration-180 last:border-b-0 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#cbff4a] motion-reduce:transition-none"
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
