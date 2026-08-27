'use client'

import { useEffect, useRef, useState } from 'react'

type ReactorState = 'idle' | 'detonated' | 'recoverable'

const scrambledGlyphs = '#!?%&*+/=<>[]{}01'

function scrambleCopy(root: HTMLElement, animate: boolean) {
  const originals = new Map<Text, string>()
  const targets = root.querySelectorAll<HTMLElement>('h1, h2, p, a, button:not([data-nuclear-control])')

  targets.forEach((target) => {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()

    while (node) {
      const textNode = node as Text
      const original = textNode.data

      if (original.trim()) originals.set(textNode, original)
      node = walker.nextNode()
    }
  })

  let intervalId = 0

  const restore = () => {
    window.clearInterval(intervalId)
    originals.forEach((original, node) => {
      if (node.isConnected) node.data = original
    })
  }

  const scramble = () => {
    originals.forEach((original, node) => {
      if (!node.isConnected) return

      node.data = [...original]
        .map((character) => {
          if (!/[a-z0-9]/i.test(character) || Math.random() > 0.58) return character
          return scrambledGlyphs[Math.floor(Math.random() * scrambledGlyphs.length)]
        })
        .join('')
    })
  }

  scramble()
  if (animate) intervalId = window.setInterval(scramble, 58)
  return restore
}

export function NuclearButton() {
  const [reactorState, setReactorState] = useState<ReactorState>('idle')
  const mainRef = useRef<HTMLElement | null>(null)
  const recoverTimerRef = useRef<number | null>(null)
  const restoreCopyRef = useRef<(() => void) | null>(null)

  const resetReactor = () => {
    if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
    restoreCopyRef.current?.()
    restoreCopyRef.current = null
    mainRef.current?.removeAttribute('data-reactor-state')
    setReactorState('idle')
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reactorState !== 'idle') {
      resetReactor()
      return
    }

    const main = event.currentTarget.closest('main')
    if (!main) return

    mainRef.current = main
    main.dataset.reactorState = 'meltdown'
    setReactorState('detonated')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    restoreCopyRef.current = scrambleCopy(main, !reducedMotion)

    recoverTimerRef.current = window.setTimeout(() => {
      setReactorState('recoverable')
    }, 1350)
  }

  useEffect(() => {
    return () => {
      if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
      restoreCopyRef.current?.()
      mainRef.current?.removeAttribute('data-reactor-state')
    }
  }, [])

  const accessibleLabel =
    reactorState === 'idle' ? 'do not press' : reactorState === 'detonated' ? 'you had one job' : 'reset'

  return (
    <div className="mt-3 ml-14 inline-flex">
      <button
        aria-label={accessibleLabel}
        className="nuclear-button group relative isolate grid min-h-12 min-w-44 cursor-pointer place-items-center overflow-visible rounded-full border border-[#ff6b61] bg-[#c92b22] px-6 font-mono text-[0.72rem] font-bold tracking-[0.08em] text-white lowercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        data-nuclear-control
        data-nuclear-state={reactorState}
        onClick={handleClick}
        type="button"
      >
        <span
          aria-hidden="true"
          className="nuclear-shockwave pointer-events-none absolute top-1/2 left-1/2 -z-10 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ff4b3e] opacity-0"
        />

        {reactorState === 'idle' ? (
          <span aria-hidden="true" className="relative grid place-items-center">
            <span className="nuclear-label nuclear-label-warning col-start-1 row-start-1">do not press</span>
            <span className="nuclear-label nuclear-label-hover col-start-1 row-start-1">don&apos;t do it</span>
            <span className="nuclear-label nuclear-label-pressed col-start-1 row-start-1">fuuuuuck</span>
          </span>
        ) : (
          <span className="nuclear-result-label">
            {reactorState === 'detonated' ? 'you had one job' : 'make it stop'}
          </span>
        )}
      </button>
    </div>
  )
}
