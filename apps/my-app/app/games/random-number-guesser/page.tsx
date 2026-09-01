import type { Metadata } from 'next'
import { RandomNumberGuesserPage } from './random-number-guesser-page'

export const metadata: Metadata = {
  title: 'random number guesser',
  description: 'A higher-or-lower number guessing game with configurable bounds and guess limits.',
  alternates: { canonical: '/games/random-number-guesser/' },
}

export default function Page() {
  return <RandomNumberGuesserPage />
}
