'use client'

import { getRandomInt } from '@repo/math/getRandomInt'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Variant } from '@repo/ui/variant'
import { type FormEvent, useMemo, useState } from 'react'
import posthog from 'posthog-js'
import type { GameConfig } from './game-types'

type Result = 'playing' | 'won' | 'lost'

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
)

type RandomNumberGameProps = {
  config: GameConfig
  onNewGame: () => void
}

export function RandomNumberGame({ config, onNewGame }: RandomNumberGameProps) {
  const [round, setRound] = useState(0)
  const [target, setTarget] = useState(() => getRandomInt(config.min, config.max))
  const [guess, setGuess] = useState('')
  const [guesses, setGuesses] = useState<number[]>([])
  const [lowerBound, setLowerBound] = useState(config.min)
  const [upperBound, setUpperBound] = useState(config.max)
  const [result, setResult] = useState<Result>('playing')
  const [message, setMessage] = useState(`i picked a number from ${config.min} to ${config.max}`)
  const [error, setError] = useState('')

  const guessesRemaining = config.maxGuesses - guesses.length
  const recommendedGuess = useMemo(() => Math.floor((lowerBound + upperBound) / 2), [lowerBound, upperBound])
  const danger = result === 'playing' && guessesRemaining === 1
  const panelTone = result === 'won' ? 'bg-success-surface' : result === 'lost' || danger ? 'bg-danger-surface' : 'bg-background'
  const rangeSpan = config.max - config.min
  const narrowedRangeStart = ((lowerBound - config.min) / rangeSpan) * 100
  const narrowedRangeWidth = ((upperBound - lowerBound) / rangeSpan) * 100
  const hasNarrowedRange = lowerBound !== config.min || upperBound !== config.max

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (result !== 'playing') return

    const parsedGuess = Number(guess)

    if (!Number.isInteger(parsedGuess)) {
      setError('enter a whole number')
      return
    }

    if (parsedGuess < config.min || parsedGuess > config.max) {
      setError(`stay between ${config.min} and ${config.max}`)
      return
    }

    if (parsedGuess < lowerBound || parsedGuess > upperBound) {
      setError(`the clues narrowed it to ${lowerBound} through ${upperBound}`)
      return
    }

    const nextGuesses = [...guesses, parsedGuess]
    setGuesses(nextGuesses)
    setGuess('')
    setError('')

    if (parsedGuess === target) {
      if (isPostHogConfigured) {
        posthog.capture('number_guessing_game_completed', {
          configured_range: config.max - config.min + 1,
          guesses_used: nextGuesses.length,
          max_guesses: config.maxGuesses,
          outcome: 'won',
        })
      }
      setLowerBound(target)
      setUpperBound(target)
      setResult('won')
      setMessage(`you got it — ${target} was the number`)
      return
    }

    if (nextGuesses.length >= config.maxGuesses) {
      if (isPostHogConfigured) {
        posthog.capture('number_guessing_game_completed', {
          configured_range: config.max - config.min + 1,
          guesses_used: nextGuesses.length,
          max_guesses: config.maxGuesses,
          outcome: 'lost',
        })
      }
      setResult('lost')
      setMessage(`out of guesses — the number was ${target}`)
      return
    }

    if (parsedGuess < target) {
      setLowerBound((current) => Math.max(current, parsedGuess + 1))
      setMessage(`${parsedGuess} is too low — go higher`)
    } else {
      setUpperBound((current) => Math.min(current, parsedGuess - 1))
      setMessage(`${parsedGuess} is too high — go lower`)
    }
  }

  function playAgain() {
    setRound((current) => current + 1)
    setTarget(getRandomInt(config.min, config.max))
    setGuess('')
    setGuesses([])
    setLowerBound(config.min)
    setUpperBound(config.max)
    setResult('playing')
    setMessage(`new number, same range: ${config.min} to ${config.max}`)
    setError('')
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col transition-colors duration-300 motion-reduce:transition-none ${panelTone}`}
      data-round={round}
    >
      <div className="flex items-start justify-between gap-5 border-b border-line px-[clamp(18px,2vw,28px)] py-5">
        <div className="min-w-0">
          <p className="m-0 font-mono text-[0.64rem] font-semibold tracking-[0.1em] text-muted lowercase">
            {result === 'playing' ? `${guessesRemaining} guesses left` : 'round complete'}
          </p>
          <p className="mt-2 truncate text-sm text-subhead" aria-live="polite" aria-atomic="true">
            {message}
          </p>
        </div>
        <Button className="shrink-0" onClick={onNewGame} variant={Variant.GLASS}>
          new game
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-[clamp(18px,2vw,28px)] py-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="m-0 font-mono text-[0.64rem] tracking-[0.08em] text-muted lowercase">
              {result === 'playing' ? 'recommended guess' : result === 'won' ? 'nice work' : 'better luck next round'}
            </p>
            <p className="mt-1 text-[clamp(4.4rem,10vw,7.2rem)] leading-[0.82] font-[520] tracking-[-0.04em] tabular-nums">
              {result === 'playing' ? recommendedGuess : target}
            </p>
          </div>
          <p className="m-0 pb-1 text-right font-mono text-[0.66rem] leading-[1.6] tracking-[0.04em] text-muted lowercase">
            possible range
            <br />
            <span className="text-foreground tabular-nums">
              {lowerBound}—{upperBound}
            </span>
          </p>
        </div>

        <div className="relative mt-7 h-px bg-line" aria-hidden="true">
          <span
            className={`absolute top-0 h-px bg-success transition-[left,width,opacity] duration-300 ease-out motion-reduce:transition-none ${hasNarrowedRange ? 'opacity-100' : 'opacity-0'}`}
            style={{ left: `${narrowedRangeStart}%`, width: `${narrowedRangeWidth}%` }}
          />
          <span className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-foreground" />
          <span className="absolute top-1/2 right-0 size-2 -translate-y-1/2 rounded-full bg-foreground" />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent transition-[left] duration-300 motion-reduce:transition-none"
            style={{ left: `${((recommendedGuess - config.min) / (config.max - config.min)) * 100}%` }}
          />
        </div>

        <p className="mt-5 line-clamp-2 font-mono text-[0.64rem] leading-[1.7] tracking-[0.04em] text-muted lowercase">
          tried: {guesses.join(' · ')}
        </p>
      </div>

      <div className="border-t border-line px-[clamp(18px,2vw,28px)] py-4">
        {result === 'playing' ? (
          <form className="flex items-start gap-3" onSubmit={submitGuess}>
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="number-guess">
                your guess
              </label>
              <Input
                ariaInvalid={Boolean(error)}
                className="w-full placeholder:text-muted"
                id="number-guess"
                inputMode="numeric"
                max={config.max}
                min={config.min}
                name="guess"
                placeholder={`try ${recommendedGuess}`}
                required
                setValue={setGuess}
                step={1}
                type="number"
                value={guess}
                variant={Variant.SECONDARY}
              />
            </div>
            <Button type="submit" variant={Variant.PRIMARY}>
              guess
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="m-0 font-mono text-[0.66rem] tracking-[0.04em] text-muted lowercase">want another number?</p>
            <Button onClick={playAgain} variant={Variant.PRIMARY}>
              play again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
