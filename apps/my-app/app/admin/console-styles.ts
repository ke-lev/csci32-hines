// Shared between the console shell and its panels so a row in one tab lines up with a row in the
// next: same hairline, same fluid inset, same hover surface.
export const rowClasses =
  'grid w-full items-center gap-4 border-b border-line px-[clamp(18px,2vw,28px)] py-3.5 text-left last:border-b-0'

export const interactiveRowClasses = `${rowClasses} transition-colors duration-180 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none`

export const noticeClasses = 'px-[clamp(18px,2vw,28px)] py-4 text-xs text-muted'

export const controlClasses =
  'rounded-xs border border-line bg-background px-2.5 py-1.5 font-mono text-[0.64rem] tracking-[0.05em] text-foreground transition-colors duration-180 hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-background motion-reduce:transition-none'

export const toolbarClasses =
  'flex flex-wrap items-center gap-2.5 border-b border-line bg-surface px-[clamp(18px,2vw,28px)] py-3'
