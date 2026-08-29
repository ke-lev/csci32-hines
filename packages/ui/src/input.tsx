'use client'

import type { HTMLInputTypeAttribute, MouseEvent } from 'react'
import { getInputSizeStyles, Size } from './size'
import { getCommonStyles } from './tokens'
import { getVariantBorderStyles, getVariantInputTextStyles, getVariantOutlineStyles, Variant } from './variant'

export type InputValue = string | number | readonly string[]

export interface InputProps {
  autoComplete?: string
  className?: string
  defaultValue?: InputValue
  id: string
  maxLength?: number
  name: string
  placeCaretAtEndOnEdgeClick?: boolean
  placeholder?: string
  required?: boolean
  setValue?: (newValue: string) => void
  size?: Size
  type?: HTMLInputTypeAttribute
  value?: InputValue
  variant?: Variant
}

const baseClasses =
  'min-w-0 rounded-full border bg-[var(--color-background)] leading-none transition-[background-color,border-color,color,box-shadow] duration-180 ease-out focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

export function Input({
  autoComplete,
  className,
  defaultValue,
  id,
  maxLength,
  name,
  placeCaretAtEndOnEdgeClick = false,
  placeholder,
  required,
  setValue,
  size = Size.MEDIUM,
  type = 'text',
  value,
  variant = Variant.PRIMARY,
}: InputProps) {
  const completedClasses = [
    baseClasses,
    getCommonStyles(),
    getInputSizeStyles(size),
    getVariantBorderStyles(variant),
    getVariantInputTextStyles(variant),
    getVariantOutlineStyles(variant),
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (!placeCaretAtEndOnEdgeClick || event.detail === 0) return

    const input = event.currentTarget
    const bounds = input.getBoundingClientRect()
    const styles = window.getComputedStyle(input)
    const fontSize = Number.parseFloat(styles.fontSize)
    const parsedLineHeight = Number.parseFloat(styles.lineHeight)
    const lineHeight = Number.isNaN(parsedLineHeight) ? fontSize : parsedLineHeight
    const textTop = bounds.top + (bounds.height - lineHeight) / 2
    const textBottom = textTop + lineHeight
    const textLeft = bounds.left + input.clientLeft + Number.parseFloat(styles.paddingLeft)
    const textRight = bounds.right - input.clientLeft - Number.parseFloat(styles.paddingRight)
    const clickedChrome =
      event.clientX < textLeft ||
      event.clientX > textRight ||
      event.clientY < textTop ||
      event.clientY > textBottom

    if (clickedChrome) {
      const end = input.value.length
      input.setSelectionRange(end, end)
    }
  }

  return (
    <input
      autoComplete={autoComplete}
      className={completedClasses}
      defaultValue={defaultValue}
      id={id}
      maxLength={maxLength}
      name={name}
      onChange={setValue ? (event) => setValue(event.currentTarget.value) : undefined}
      onClick={handleClick}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  )
}
