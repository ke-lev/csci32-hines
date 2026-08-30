'use client'

import { useState } from 'react'
import { PageIntro } from '../../components/page-intro'
import { PageShell } from '../../components/page-shell'
import type { GameConfig } from './game-types'
import { RandomNumberGame } from './random-number-game'
import { RandomNumberGameMenu } from './random-number-game-menu'

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
      left={
        <PageIntro
          body={
            'choose the range and how many tries you get. after every miss, the possible interval tightens and the midpoint becomes your next recommended move.'
          }
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
