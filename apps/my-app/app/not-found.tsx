import type { Metadata } from 'next'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { PageIntro } from './components/page-intro'
import { PageShell } from './components/page-shell'

export const metadata: Metadata = {
  title: 'not found',
  description: 'This route does not exist.',
  robots: { follow: false, index: false },
}

export default function NotFound() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: '404', href: '/' },
      ]}
      rightInset={false}
      titleId="not-found-title"
      left={
        <PageIntro
          title="you lost?"
          titleId="not-found-title"
          subhead="cus whatever you're looking for, it ain't here"
          body={'either it moved, it never even existed, maybe you just typed some shit in\nidk man'}
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/" size={Size.LARGE} variant={Variant.PRIMARY}>
              take me home
            </Button>
            <Button href="/users/" size={Size.LARGE} variant={Variant.SECONDARY}>
              open the shell
            </Button>
          </div>
        </PageIntro>
      }
      right={
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="m-0 font-mono text-[clamp(4.5rem,10vw,8rem)] leading-none font-medium tracking-[-0.04em]">
            404
          </p>
          <h2 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">no such file or directory</h2>
          <p className="mt-4 max-w-[34ch] text-base leading-7 text-muted">nothing to see here</p>
        </section>
      }
    />
  )
}
