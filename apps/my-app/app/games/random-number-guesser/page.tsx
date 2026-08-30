import type { Metadata } from 'next'
import { RandomNumberGuesserPage } from './random-number-guesser-page'

export const metadata: Metadata = {
  title: 'random number guesser | kelev',
  description: 'A higher-or-lower number guessing game with configurable bounds and guess limits.',
}

export default function Page() {
  return <RandomNumberGuesserPage />
}
