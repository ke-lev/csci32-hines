import type { Metadata } from 'next'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { NuclearButton } from './nuclear-button'
import { PupilButtons } from './pupil-buttons'

export const metadata: Metadata = {
  title: 'buttons',
  description: 'Button variants, sizes, and a few that misbehave on purpose.',
  alternates: { canonical: '/buttons/' },
}

const sizes = [Size.SMALL, Size.MEDIUM, Size.LARGE]

const variants = [
  {
    name: 'primary',
    description: 'the important stuff · black on white',
    variant: Variant.PRIMARY,
  },
  {
    name: 'secondary',
    description: 'alternate action · white on black',
    variant: Variant.SECONDARY,
  },
  {
    name: 'tertiary',
    description: 'quiet action · underlined on nothing',
    variant: Variant.TERTIARY,
  },
  {
    name: 'glass',
    description: 'not liquid, just frosty · blur on whatever',
    variant: Variant.GLASS,
  },
]

export default function ButtonsPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'buttons', href: '/buttons/' },
      ]}
      titleId="buttons-title"
      left={
        <PageIntro
          title="button repository"
          titleId="buttons-title"
          subhead="variants, sizes, states, all that - pulled from the ui package"
          body="ideas: baduibattle type shit, like buttons that run away, buttons that watch you, buttons that turn into other buttons, buttons that are shaped like things, idk"
        >
          <PupilButtons />
          <NuclearButton />
        </PageIntro>
      }
      right={
        <div className="min-h-0 flex flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin]">
          {variants.map((item) => (
            <section
              aria-labelledby={`${item.name}-buttons`}
              className="relative flex min-h-24 flex-1 flex-col justify-center gap-2 overflow-hidden border-b border-line px-[clamp(18px,2vw,28px)] py-5 last:border-b-0 max-[900px]:flex-none"
              key={item.name}
            >
              <div className="relative z-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2
                  className="m-0 font-mono text-[0.72rem] font-semibold tracking-[0.04em] lowercase"
                  id={`${item.name}-buttons`}
                >
                  {item.name}
                </h2>
                <p className="m-0 text-right text-[0.72rem] leading-5 text-muted">{item.description}</p>
              </div>
              <div className="relative z-10 flex flex-wrap items-center justify-end gap-3">
                {item.variant === Variant.GLASS && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-0 h-1 w-[58%] translate-x-5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#ff375f_0%,#ff9f0a_20%,#ffd60a_38%,#30d158_55%,#64d2ff_73%,#bf5af2_100%)]"
                  />
                )}
                {sizes.map((size) => (
                  <Button key={size} size={size} variant={item.variant}>
                    {size}
                  </Button>
                ))}
              </div>
            </section>
          ))}
        </div>
      }
    />
  )
}
