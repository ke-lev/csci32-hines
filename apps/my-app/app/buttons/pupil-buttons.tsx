'use client'

import { useEffect, useRef } from 'react'

const pupilButtons = [
  {
    href: 'https://maps.deflock.org/?lat=39.6482&lng=-121.6464&zoom=10.00',
    label: 'deflock.org',
    range: 7,
    style: 'outlined',
  },
  {
    label: 'play dead',
    range: 10,
    style: 'round',
  },
] as const

function Pupil({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid size-7 shrink-0 place-items-center rounded-full ${inverted ? 'bg-foreground' : ''}`}
    >
      <span className="pupil-tracker relative block size-3 text-background">
        <span className="pupil-dot absolute inset-0 rounded-full bg-current" />
        <span className="pupil-mark absolute inset-0">
          <span className="absolute top-1/2 left-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
          <span className="pupil-mark-cross absolute top-1/2 left-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-current" />
        </span>
      </span>
    </span>
  )
}

export function PupilButtons() {
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const group = groupRef.current

    if (!group) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let hasPointerPosition = false
    let pointerX = 0
    let pointerY = 0

    const updatePupils = () => {
      animationFrame = 0

      group.querySelectorAll<HTMLElement>('[data-pupil]').forEach((pupil) => {
        const button = pupil.closest<HTMLElement>('[data-pupil-button]')

        if (!button || reducedMotion.matches || !hasPointerPosition) {
          pupil.style.setProperty('--pupil-x', '0px')
          pupil.style.setProperty('--pupil-y', '0px')
          return
        }

        const rect = button.getBoundingClientRect()
        const deltaX = pointerX - (rect.left + rect.width / 2)
        const deltaY = pointerY - (rect.top + rect.height / 2)
        const distance = Math.hypot(deltaX, deltaY)
        const range = Number(button.dataset.pupilRange ?? 8)
        const travel = Math.min(range, distance * 0.045)
        const x = distance === 0 ? 0 : (deltaX / distance) * travel
        const y = distance === 0 ? 0 : (deltaY / distance) * travel

        pupil.style.setProperty('--pupil-x', `${x.toFixed(2)}px`)
        pupil.style.setProperty('--pupil-y', `${y.toFixed(2)}px`)
      })
    }

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updatePupils)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      hasPointerPosition = true
      pointerX = event.clientX
      pointerY = event.clientY
      scheduleUpdate()
    }

    const handleMotionPreference = () => {
      scheduleUpdate()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    reducedMotion.addEventListener('change', handleMotionPreference)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
      reducedMotion.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  return (
    <div ref={groupRef} className="mt-8 flex flex-wrap items-center gap-3">
      {pupilButtons.map((button) => {
        if (button.style === 'outlined') {
          return (
            <a
              className="pupil-button inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full border border-foreground bg-background py-2 pr-3 pl-5 font-mono text-[0.72rem] font-semibold tracking-[0.04em] text-foreground lowercase transition-[transform,background-color,color] duration-180 ease-out hover:-translate-y-0.5 hover:bg-foreground hover:text-background active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
              data-pupil-button
              data-pupil-range={button.range}
              href={button.href}
              key={button.style}
              rel="noopener noreferrer"
              target="_blank"
            >
              {button.label}
              <span data-pupil>
                <Pupil inverted />
              </span>
            </a>
          )
        }

        return (
          <button
            aria-label={button.label}
            className="pupil-button grid size-12 cursor-pointer place-items-center rounded-full border border-foreground bg-foreground text-background transition-transform duration-180 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
            data-pupil-button
            data-pupil-range={button.range}
            key={button.style}
            title={button.label}
            type="button"
          >
            <span data-pupil>
              <Pupil />
            </span>
          </button>
        )
      })}
    </div>
  )
}
