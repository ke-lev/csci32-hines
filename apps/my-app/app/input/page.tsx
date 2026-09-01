import type { Metadata } from 'next'
import { NameDrawingPage } from './name-drawing-page'

export const metadata: Metadata = {
  title: 'input',
  description: 'Turns a first and last name into one continuous, deterministic line drawing.',
  alternates: { canonical: '/input/' },
}

export default function InputPage() {
  return <NameDrawingPage />
}
