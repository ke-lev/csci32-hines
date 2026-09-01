'use client'

import { useReactorMeltdown } from '../components/use-reactor-meltdown'

export function NuclearButton() {
  const { reactorState, reset, trigger } = useReactorMeltdown()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reactorState !== 'idle') {
      reset()
      return
    }

    trigger(event.currentTarget)
  }

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
