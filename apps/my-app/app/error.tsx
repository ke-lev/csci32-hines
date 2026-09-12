'use client'

import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { PageIntro } from './components/page-intro'
import { PageShell } from './components/page-shell'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
)

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (isPostHogConfigured) posthog.captureException(error)
    console.error(error)
  }, [error])

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: '500', href: '/' },
      ]}
      rightInset={false}
      titleId="error-title"
      left={
        <PageIntro
          title="uh oh"
          titleId="error-title"
          subhead="something broke, and it was not the red button"
          body="probably my fault. try again, and if it keeps happening... idk maybe try again later?"
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={reset} size={Size.LARGE} variant={Variant.PRIMARY}>
              try again
            </Button>
            <Button href="/" size={Size.LARGE} variant={Variant.SECONDARY}>
              go home
            </Button>
          </div>
        </PageIntro>
      }
      right={
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="m-0 font-mono text-[clamp(4.5rem,10vw,8rem)] leading-none font-medium tracking-[-0.04em]">
            500
          </p>
          <h2 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">unhandled exception</h2>
          <p className="mt-4 max-w-[34ch] text-base leading-7 text-muted">
            {error.digest ? `digest ${error.digest}` : 'no digest, no dignity, no idea'}
          </p>
        </section>
      }
    />
  )
}
