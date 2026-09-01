import type { Metadata } from 'next'
import { GameOfLifePage } from './game-of-life-page'

export const metadata: Metadata = {
  title: "conway's game of life",
  description: 'A small, playable Conway’s Game of Life simulation.',
  alternates: { canonical: '/games/game-of-life/' },
}

export default function Page() {
  return <GameOfLifePage />
}
