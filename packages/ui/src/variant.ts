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
    'border-[var(--ui-glass-border)] bg-[var(--ui-glass)] text-[var(--color-foreground)] shadow-[var(--ui-glass-shadow)] backdrop-blur-xl backdrop-saturate-150 hover:border-[var(--ui-glass-border-hover)] hover:bg-[var(--ui-glass-hover)]',
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
    'border-[var(--ui-glass-border)] bg-[var(--ui-glass)] backdrop-blur-xl backdrop-saturate-150 hover:border-[var(--ui-glass-border-hover)] hover:bg-[var(--ui-glass-hover)]',
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
