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
              className="m-0 font-mono text-[0.66rem] tracking-[0.03em] text-[#ff8f86] lowercase"
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
        <p className="m-0 font-mono text-[0.62rem] tracking-[0.06em] text-muted lowercase">no peeking</p>
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
      <Input
        ariaDescribedBy={describedBy}
        ariaInvalid={error}
        className="w-full"
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
    </label>
  )
}
