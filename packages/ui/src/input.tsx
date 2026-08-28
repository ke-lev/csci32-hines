'use client'

import type { HTMLInputTypeAttribute } from 'react'
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

  return (
    <input
      autoComplete={autoComplete}
      className={completedClasses}
      defaultValue={defaultValue}
      id={id}
      maxLength={maxLength}
      name={name}
      onChange={setValue ? (event) => setValue(event.currentTarget.value) : undefined}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  )
}
