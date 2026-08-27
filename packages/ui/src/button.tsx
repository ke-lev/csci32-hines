'use client'

import type { ReactNode } from 'react'
import { Size } from './size'
import { Variant } from './variant'

interface ButtonProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  size?: Size
  type?: 'button' | 'reset' | 'submit'
  variant?: Variant
}

const sizeClasses: Record<Size, string> = {
  [Size.SMALL]: 'min-h-6 px-2.5 py-1.5 text-[0.58rem] tracking-[0.05em]',
  [Size.MEDIUM]: 'px-[18px] py-[11px] text-[0.72rem] tracking-[0.04em]',
  [Size.LARGE]: 'min-h-12 px-7 py-4 text-[0.86rem] tracking-[0.035em]',
}

const variantClasses: Record<Variant, string> = {
  [Variant.PRIMARY]: 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-[var(--color-background)]',
  [Variant.SECONDARY]: 'border-[var(--color-foreground)] bg-[var(--color-background)] text-[var(--color-foreground)]',
  [Variant.TERTIARY]:
    'border-transparent bg-transparent text-[var(--color-foreground)] underline decoration-[1px] underline-offset-4 hover:decoration-2',
  [Variant.GLASS]:
    'border-white/25 bg-white/[0.08] text-[var(--color-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-xl backdrop-saturate-150 hover:border-white/40 hover:bg-white/[0.12]',
}

const baseClasses =
  'relative isolate inline-flex cursor-pointer select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full border font-mono leading-none font-semibold lowercase transition-[transform,background-color,border-color,color,box-shadow] duration-180 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'

export function Button({
  children,
  className,
  href,
  onClick,
  size = Size.MEDIUM,
  type = 'button',
  variant = Variant.PRIMARY,
}: ButtonProps) {
  const completedClasses = [baseClasses, sizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(' ')

  const content = <span className="relative z-10">{children}</span>

  if (href) {
    return (
      <a className={completedClasses} href={href} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button className={completedClasses} onClick={onClick} type={type}>
      {content}
    </button>
  )
}
