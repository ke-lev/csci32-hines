import type { ReactNode } from 'react'
import Link from 'next/link'

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
    <main className="flex min-h-svh flex-col overflow-hidden px-8 py-7 max-[900px]:p-6 max-[560px]:p-5">
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
                className="rounded-xs transition-colors duration-180 hover:text-muted focus-visible:text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
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
          <a
            className="rounded-full border border-foreground bg-foreground px-[15px] py-[9px] font-mono text-[0.68rem] leading-none font-[650] tracking-[0.04em] text-background transition duration-180 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
            href="https://github.com/ke-lev"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </nav>
      </header>

      <section
        className="grid flex-1 grid-cols-2 items-center gap-[clamp(40px,5vw,80px)] py-[clamp(72px,10vh,132px)] [--panel-h:clamp(420px,62vh,650px)] max-[900px]:grid-cols-1 max-[900px]:gap-18 max-[900px]:py-20 max-[560px]:gap-16 max-[560px]:py-[68px] max-[560px]:pb-[60px]"
        aria-labelledby={titleId}
      >
        {left}
        <div className="flex h-[var(--panel-h)] w-full max-w-[620px] justify-self-center overflow-hidden rounded-[2rem] border border-line bg-background max-[900px]:h-[min(520px,62svh)] max-[900px]:max-w-none max-[560px]:h-[420px]">
          <div
            className={`flex min-w-0 flex-1 flex-col ${rightInset ? 'p-[clamp(12px,1.4vw,20px)]' : ''}`}
          >
            {right}
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between gap-5 border-t border-line pt-5 font-mono text-[0.66rem] tracking-[0.08em] text-footer lowercase">
        <p className="m-0 flex items-center gap-[9px] text-[0.68rem] tracking-[0.08em] text-muted" title="us too">
          <span
            className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(142,197,255,0.5)]"
            aria-hidden="true"
          />
          experiencing interruptions?
        </p>
        <p className="m-0">git&apos;n init © 2026</p>
      </footer>
    </main>
  )
}
