import type { Metadata } from 'next'
import { GameOfLifePage } from './game-of-life-page'

export const metadata: Metadata = {
  title: "conway's game of life | kelev",
  description: 'A small, playable Conway’s Game of Life simulation.',
}

export default function Page() {
  return <GameOfLifePage />
}
