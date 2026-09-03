import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'cursive',
  description: 'The homepage, redrawn with a full-width cursive SVG hello.',
  alternates: { canonical: '/cursive/' },
}

export default function CursiveLayout({ children }: { children: ReactNode }) {
  return children
}
