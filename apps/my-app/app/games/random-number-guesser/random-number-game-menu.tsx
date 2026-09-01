'use client'

import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Variant } from '@repo/ui/variant'
import { type FormEvent, useState } from 'react'
import type { GameConfig } from './game-types'

type RandomNumberGameMenuProps = {
  onStart: (config: GameConfig) => void
}

function parseInteger(value: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

export function RandomNumberGameMenu({ onStart }: RandomNumberGameMenuProps) {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [maxGuesses, setMaxGuesses] = useState('7')
  const [error, setError] = useState('')

  function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedMin = parseInteger(min)
    const parsedMax = parseInteger(max)
    const parsedMaxGuesses = parseInteger(maxGuesses)

    if (parsedMin === null || parsedMax === null || parsedMaxGuesses === null) {
      setError('use whole numbers for every setting')
      return
    }

    if (parsedMin >= parsedMax) {
      setError('the maximum needs to be greater than the minimum')
      return
    }

    if (parsedMax - parsedMin > 1_000_000) {
      setError('keep the range within 1,000,000 numbers')
      return
    }

    if (parsedMaxGuesses < 1 || parsedMaxGuesses > 20) {
      setError('choose between 1 and 20 guesses')
      return
    }

    setError('')
    onStart({ min: parsedMin, max: parsedMax, maxGuesses: parsedMaxGuesses })
  }

  const describedBy = error ? 'game-settings-error' : 'game-settings-help'

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={startGame}>
      <div className="border-b border-line px-[clamp(18px,2vw,28px)] py-5">
        <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
          set the bounds
        </h2>
      </div>

      <div className="grid flex-1 content-center grid-cols-2 gap-4 px-[clamp(18px,2vw,28px)] py-5 max-[460px]:gap-3">
        <NumberSetting
          describedBy={describedBy}
          error={Boolean(error)}
          id="game-min"
          label="minimum"
          name="minimum"
          setValue={setMin}
          value={min}
        />
        <NumberSetting
          describedBy={describedBy}
          error={Boolean(error)}
          id="game-max"
          label="maximum"
          name="maximum"
          setValue={setMax}
          value={max}
        />
        <div className="col-span-2">
          <NumberSetting
            describedBy={describedBy}
            error={Boolean(error)}
            id="game-max-guesses"
            label="guesses allowed"
            max={20}
            min={1}
            name="maxGuesses"
            setValue={setMaxGuesses}
            value={maxGuesses}
          />
        </div>

        <div className="col-span-2 min-h-5" aria-live="polite">
          {error ? (
            <p
              className="m-0 font-mono text-[0.66rem] tracking-[0.03em] text-danger lowercase"
              id="game-settings-error"
            >
              {error}
            </p>
          ) : (
            <p className="m-0 font-mono text-[0.66rem] tracking-[0.03em] text-muted lowercase" id="game-settings-help">
              both ends of the range are fair game
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-[clamp(18px,2vw,28px)] py-4">
        <p className="m-0 font-mono text-[0.62rem] tracking-[0.06em] text-muted lowercase">good luck!</p>
        <Button type="submit" variant={Variant.PRIMARY}>
          start game
        </Button>
      </div>
    </form>
  )
}

type NumberSettingProps = {
  describedBy: string
  error: boolean
  id: string
  label: string
  max?: number
  min?: number
  name: string
  setValue: (value: string) => void
  value: string
}

function NumberSetting({ describedBy, error, id, label, max, min, name, setValue, value }: NumberSettingProps) {
  return (
    <label
      className="flex min-w-0 flex-col gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.04em] lowercase"
      htmlFor={id}
    >
      {label}
      <NumberStepper
        ariaDescribedBy={describedBy}
        ariaInvalid={error}
        id={id}
        max={max}
        min={min}
        name={name}
        setValue={setValue}
        value={value}
      />
    </label>
  )
}

type NumberStepperProps = {
  ariaDescribedBy: string
  ariaInvalid: boolean
  id: string
  max?: number
  min?: number
  name: string
  setValue: (value: string) => void
  value: string
}

function NumberStepper({ ariaDescribedBy, ariaInvalid, id, max, min, name, setValue, value }: NumberStepperProps) {
  function stepBy(amount: number) {
    const currentValue = Number(value)
    const startingValue = Number.isFinite(currentValue) ? currentValue : (min ?? 0)
    const nextValue = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, startingValue + amount))
    setValue(String(nextValue))
  }

  return (
    <div className="group/stepper relative">
      <Input
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
        className="w-full pr-[3.75rem] [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        id={id}
        inputMode="numeric"
        max={max}
        min={min}
        name={name}
        required
        setValue={setValue}
        step={1}
        type="number"
        value={value}
        variant={Variant.SECONDARY}
      />
      <div className="absolute top-1.5 right-2 bottom-1.5 flex w-10 flex-col overflow-hidden rounded-full border border-line bg-row-hover transition-colors duration-180 group-focus-within/stepper:border-accent motion-reduce:transition-none">
        <button
          aria-label={`increase ${name}`}
          className="flex flex-1 items-center justify-center border-b border-line text-muted transition-colors duration-180 hover:bg-foreground hover:text-background focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
          onClick={() => stepBy(1)}
          type="button"
        >
          <Chevron direction="up" />
        </button>
        <button
          aria-label={`decrease ${name}`}
          className="flex flex-1 items-center justify-center text-muted transition-colors duration-180 hover:bg-foreground hover:text-background focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
          onClick={() => stepBy(-1)}
          type="button"
        >
          <Chevron direction="down" />
        </button>
      </div>
    </div>
  )
}

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 12 12">
      <path
        d={direction === 'up' ? 'M2.5 7.5 6 4l3.5 3.5' : 'm2.5 4.5 3.5 3.5 3.5-3.5'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
