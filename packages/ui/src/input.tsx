'use client'

import type { ChangeEvent, FocusEvent, HTMLInputTypeAttribute, MouseEvent, Ref } from 'react'
import { getInputSizeStyles, Size } from './size'
import { getCommonStyles } from './tokens'
import { getVariantBorderStyles, getVariantInputTextStyles, getVariantOutlineStyles, Variant } from './variant'

export type InputValue = string | number | readonly string[]

export interface InputProps {
  ariaDescribedBy?: string
  ariaInvalid?: boolean
  autoComplete?: string
  className?: string
  defaultValue?: InputValue
  id: string
  inputMode?: 'decimal' | 'email' | 'none' | 'numeric' | 'search' | 'tel' | 'text' | 'url'
  max?: number | string
  maxLength?: number
  min?: number | string
  name: string
  // onBlur/onChange/ref exist so a form library can drive this input directly. react-hook-form's
  // register() returns exactly that trio plus `name`, and a dropped ref means it silently never
  // tracks the field, so these are passed straight through to the DOM node.
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  placeCaretAtEndOnEdgeClick?: boolean
  placeholder?: string
  ref?: Ref<HTMLInputElement>
  required?: boolean
  setValue?: (newValue: string) => void
  size?: Size
  step?: number | string
  type?: HTMLInputTypeAttribute
  value?: InputValue
  variant?: Variant
}

const baseClasses =
  'min-w-0 rounded-full border bg-[var(--color-background)] leading-none transition-[background-color,border-color,color,box-shadow] duration-180 ease-out focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

export function Input({
  ariaDescribedBy,
  ariaInvalid,
  autoComplete,
  className,
  defaultValue,
  id,
  inputMode,
  max,
  maxLength,
  min,
  name,
  onBlur,
  onChange,
  placeCaretAtEndOnEdgeClick = false,
  placeholder,
  ref,
  required,
  setValue,
  size = Size.MEDIUM,
  step,
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
      event.clientX < textLeft || event.clientX > textRight || event.clientY < textTop || event.clientY > textBottom

    if (clickedChrome) {
      const end = input.value.length
      input.setSelectionRange(end, end)
    }
  }

  // both may be supplied: `setValue` is this repo's existing string-based callback, `onChange`
  // is the raw DOM handler a form library hands over. neither wins; both run.
  const handleChange =
    onChange || setValue
      ? (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event)
          setValue?.(event.currentTarget.value)
        }
      : undefined

  return (
    <input
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      autoComplete={autoComplete}
      className={completedClasses}
      defaultValue={defaultValue}
      id={id}
      inputMode={inputMode}
      max={max}
      maxLength={maxLength}
      min={min}
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      onClick={handleClick}
      placeholder={placeholder}
      ref={ref}
      required={required}
      step={step}
      type={type}
      value={value}
    />
  )
}
