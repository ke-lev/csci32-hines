'use client'

import { useState } from 'react'
import { PageIntro } from '../../components/page-intro'
import { PageShell } from '../../components/page-shell'
import type { GameConfig } from './game-types'
import { RandomNumberGame } from './random-number-game'
import { RandomNumberGameMenu } from './random-number-game-menu'

const pageInfo = [
  '/games/random-number-guesser',
  'the game chooses one integer inside your range and keeps it fixed until you win, run out of guesses, or start over.',
  '**after a miss:** the guess becomes a new hard edge of the possible interval. the recommendation is always the midpoint of what remains, which cuts the search space roughly in half each turn.',
]

export function RandomNumberGuesserPage() {
  const [config, setConfig] = useState<GameConfig | null>(null)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'games', href: '/games/' },
        { label: 'rng', href: '/games/random-number-guesser/' },
      ]}
      info={pageInfo}
      left={
        <PageIntro
          body={'choose the range and your number of tries. follow the midpoint hint, ignore it, or start a new game.'}
          subhead="i’m thinking of an integer"
          title={
            <>
              guess
              <br />
              again
            </>
          }
          titleId="number-guesser-title"
        />
      }
      right={
        config ? (
          <RandomNumberGame config={config} onNewGame={() => setConfig(null)} />
        ) : (
          <RandomNumberGameMenu onStart={setConfig} />
        )
      }
      rightInset={false}
      titleId="number-guesser-title"
    />
  )
}
