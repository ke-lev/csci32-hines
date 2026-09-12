import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { HelpDocModal } from './help-doc-modal'
import { ThemeToggle } from './theme-toggle'
import { TipsModal } from './tips-modal'

type Breadcrumb = {
  href: string
  label: string
}

type PageShellProps = {
  breadcrumbs: Breadcrumb[]
  left: ReactNode
  right: ReactNode
  rightInset?: boolean
  titleId: string
}

export function PageShell({ breadcrumbs, left, right, rightInset = true, titleId }: PageShellProps) {
  return (
    <main className="flex h-svh flex-col overflow-hidden px-8 py-7 max-[900px]:h-auto max-[900px]:min-h-svh max-[900px]:p-6 max-[560px]:p-5 short:h-auto short:min-h-svh short:overflow-visible">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <nav
          className="flex items-center font-mono text-[0.76rem] font-[650] tracking-[0.15em]"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <span
              className="mr-[5px] inline-flex items-center gap-[5px] last:mr-0"
              key={`${breadcrumb.href}-${breadcrumb.label}`}
            >
              <Link
                className="inline-flex min-h-7 items-center rounded-xs transition-colors duration-180 hover:text-muted focus-visible:text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
                href={breadcrumb.href}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {breadcrumb.label}
              </Link>
              <span className="text-muted" aria-hidden="true">
                /
              </span>
            </span>
          ))}
        </nav>

        <nav className="flex items-center gap-2" aria-label="Site links">
          <Link
            className="mr-1 inline-flex min-h-7 items-center rounded-xs font-mono text-[0.72rem] font-[650] tracking-[0.12em] text-muted lowercase transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
            href="/help/"
          >
            help
          </Link>
          <ThemeToggle />
          <TipsModal />
        </nav>
      </header>

      <section
        className="grid min-h-0 flex-1 grid-cols-2 items-center gap-[clamp(40px,5vw,80px)] py-[clamp(72px,10vh,132px)] [--panel-h:clamp(420px,62vh,650px)] max-[900px]:grid-cols-1 max-[900px]:gap-18 max-[900px]:py-20 max-[560px]:gap-16 max-[560px]:py-[68px] max-[560px]:pb-[60px] short:py-12"
        aria-labelledby={titleId}
      >
        {left}
        <div className="flex h-[var(--panel-h)] w-full max-w-[620px] justify-self-center overflow-hidden rounded-[2rem] border border-line bg-background max-[900px]:h-[min(520px,62svh)] max-[900px]:max-w-none max-[560px]:h-[420px]">
          <div className={`flex min-w-0 flex-1 flex-col ${rightInset ? 'p-[clamp(12px,1.4vw,20px)]' : ''}`}>
            {right}
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-end gap-5 border-t border-line pt-5 font-mono text-[0.66rem] tracking-[0.08em] text-foreground lowercase">
        <div className="flex items-center gap-2.5">
          <p className="m-0">git&apos;n init © 2026</p>
          <HelpDocModal />
          <Button
            className="size-9 min-h-0 border-0 bg-black p-0 text-white hover:border-0 hover:bg-black"
            href="https://github.com/ke-lev"
            rel="noopener noreferrer"
            size={Size.SMALL}
            target="_blank"
            variant={Variant.SECONDARY}
          >
            <svg className="size-5" viewBox="0 0 16 16" fill="currentColor" role="img" aria-label="GitHub">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </Button>
        </div>
      </footer>
    </main>
  )
}
