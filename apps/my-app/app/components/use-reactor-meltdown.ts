'use client'

import { useEffect, useRef, useState } from 'react'

export type ReactorState = 'idle' | 'detonated' | 'recoverable'

const scrambledGlyphs = '#!?%&*+/=<>[]{}01'
const scrambleTargets = 'h1, h2, p, a, button:not([data-nuclear-control]), [data-scramble]'

function scrambleCopy(root: HTMLElement, animate: boolean) {
  const originals = new Map<Text, string>()
  const targets = root.querySelectorAll<HTMLElement>(scrambleTargets)

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

type ReactorOptions = {
  recoverableAfter?: number
}

export function useReactorMeltdown({ recoverableAfter = 1350 }: ReactorOptions = {}) {
  const [reactorState, setReactorState] = useState<ReactorState>('idle')
  const mainRef = useRef<HTMLElement | null>(null)
  const recoverTimerRef = useRef<number | null>(null)
  const restoreCopyRef = useRef<(() => void) | null>(null)

  const reset = () => {
    if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
    recoverTimerRef.current = null
    restoreCopyRef.current?.()
    restoreCopyRef.current = null
    mainRef.current?.removeAttribute('data-reactor-state')
    mainRef.current = null
    setReactorState('idle')
  }

  const trigger = (origin: Element | null | undefined) => {
    const main = origin?.closest('main')
    if (!main) return

    mainRef.current = main
    main.dataset.reactorState = 'meltdown'
    setReactorState('detonated')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    restoreCopyRef.current = scrambleCopy(main, !reducedMotion)

    recoverTimerRef.current = window.setTimeout(() => {
      setReactorState('recoverable')
    }, recoverableAfter)
  }

  useEffect(() => {
    return () => {
      if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
      restoreCopyRef.current?.()
      mainRef.current?.removeAttribute('data-reactor-state')
    }
  }, [])

  return { reactorState, reset, trigger }
}
