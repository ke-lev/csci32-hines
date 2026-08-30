'use client'

import type { HTMLAttributeAnchorTarget, ReactNode } from 'react'
import { getButtonSizeStyles, Size } from './size'
import { getCommonStyles } from './tokens'
import { getVariantBackgroundStyles, getVariantOutlineStyles, Variant } from './variant'

interface ButtonProps {
  'aria-haspopup'?: 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree'
  children: ReactNode
  className?: string
  disabled?: boolean
  href?: string
  onClick?: () => void
  rel?: string
  size?: Size
  target?: HTMLAttributeAnchorTarget
  type?: 'button' | 'reset' | 'submit'
  variant?: Variant
}

const baseClasses =
  'relative isolate inline-flex cursor-pointer select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full border leading-none font-semibold lowercase transition-[transform,background-color,border-color,color,box-shadow] duration-180 ease-out hover:-translate-y-0.5 focus-visible:outline-offset-4 active:translate-y-0 active:scale-[0.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'

export function Button({
  'aria-haspopup': ariaHasPopup,
  children,
  className,
  disabled = false,
  href,
  onClick,
  rel,
  size = Size.MEDIUM,
  target,
  type = 'button',
  variant = Variant.PRIMARY,
}: ButtonProps) {
  const completedClasses = [
    baseClasses,
    getCommonStyles(),
    getButtonSizeStyles(size),
    getVariantBackgroundStyles(variant),
    getVariantOutlineStyles(variant),
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = <span className="relative z-10">{children}</span>

  if (href) {
    return (
      <a
        aria-haspopup={ariaHasPopup}
        className={completedClasses}
        href={href}
        onClick={onClick}
        rel={rel}
        target={target}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      aria-haspopup={ariaHasPopup}
      className={completedClasses}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  )
}
