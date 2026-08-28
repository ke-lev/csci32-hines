export enum Variant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  GLASS = 'glass',
}

const variantBackgroundClasses: Record<Variant, string> = {
  [Variant.PRIMARY]: 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-[var(--color-background)]',
  [Variant.SECONDARY]: 'border-[var(--color-foreground)] bg-[var(--color-background)] text-[var(--color-foreground)]',
  [Variant.TERTIARY]:
    'border-transparent bg-transparent text-[var(--color-foreground)] underline decoration-[1px] underline-offset-4 hover:decoration-2',
  [Variant.GLASS]:
    'border-white/25 bg-white/[0.08] text-[var(--color-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-xl backdrop-saturate-150 hover:border-white/40 hover:bg-white/[0.12]',
}

const variantOutlineClasses: Record<Variant, string> = {
  [Variant.PRIMARY]: 'focus-visible:outline-[var(--color-accent)]',
  [Variant.SECONDARY]: 'focus-visible:outline-[var(--color-accent)]',
  [Variant.TERTIARY]: 'focus-visible:outline-[var(--color-accent)]',
  [Variant.GLASS]: 'focus-visible:outline-[var(--color-accent)]',
}

const variantBorderClasses: Record<Variant, string> = {
  [Variant.PRIMARY]: 'border-[var(--color-foreground)]',
  [Variant.SECONDARY]: 'border-[var(--color-line)] hover:border-[var(--color-muted)]',
  [Variant.TERTIARY]: 'border-[var(--color-line)] bg-[var(--color-row-hover)] hover:border-[var(--color-muted)]',
  [Variant.GLASS]:
    'border-white/25 bg-white/[0.08] backdrop-blur-xl backdrop-saturate-150 hover:border-white/40 hover:bg-white/[0.12]',
}

const variantInputTextClasses: Record<Variant, string> = {
  [Variant.PRIMARY]: 'text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] caret-[var(--color-accent)]',
  [Variant.SECONDARY]:
    'text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] caret-[var(--color-accent)]',
  [Variant.TERTIARY]:
    'text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] caret-[var(--color-accent)]',
  [Variant.GLASS]: 'text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] caret-[var(--color-accent)]',
}

export function getVariantBackgroundStyles(variant: Variant) {
  return variantBackgroundClasses[variant]
}

export function getVariantBorderStyles(variant: Variant) {
  return variantBorderClasses[variant]
}

export function getVariantInputTextStyles(variant: Variant) {
  return variantInputTextClasses[variant]
}

export function getVariantOutlineStyles(variant: Variant) {
  return variantOutlineClasses[variant]
}
