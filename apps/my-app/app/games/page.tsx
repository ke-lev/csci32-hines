import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'

export const metadata: Metadata = {
  title: 'games | kelev',
  description: "Small games and experiments from git'n init.",
}

const games = [
  {
    href: '/games/random-number-guesser/',
    label: '/rng',
    title: 'random number guesser',
    description: 'pick a range, narrow it down, and see how many tries you need',
  },
  {
    href: '/games/game-of-life/',
    label: '/life',
    title: 'conway’s game of life',
    description: 'waka waka waka waka waka waka waka',
  },
]

export default function GamesPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'games', href: '/games/' },
      ]}
      titleId="games-title"
      left={
        <PageIntro
          title="games"
          titleId="games-title"
          subhead="a tiny collection of stupid little games"
          body={'ideas:\ngotta come up with something original'}
        />
      }
      right={
        <nav className="flex min-h-0 flex-1 flex-col" aria-label="games">
          {games.map((game) => (
            <Link
              className="group flex min-h-22 flex-1 flex-col items-end justify-center gap-3.5 border-b border-line px-[clamp(18px,2vw,28px)] py-6 transition-colors duration-180 last:border-b-0 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#8ec5ff] motion-reduce:transition-none"
              href={game.href}
              key={game.href}
            >
              <span className="inline-flex rounded-full bg-foreground px-[15px] py-2.5 font-mono text-[0.72rem] leading-none font-[650] tracking-[0.02em] text-background transition-transform duration-180 group-hover:-translate-x-1 group-focus-visible:-translate-x-1 motion-reduce:transition-none">
                {game.label}
              </span>
              <span className="max-w-[42ch] text-right text-[0.88rem] leading-6 text-foreground">{game.title}</span>
              <span className="max-w-[42ch] text-right text-[0.88rem] leading-6 text-muted">{game.description}</span>
            </Link>
          ))}
        </nav>
      }
    />
  )
}
