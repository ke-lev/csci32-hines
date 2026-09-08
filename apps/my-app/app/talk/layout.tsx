import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'talk',
  description: 'the one public room.',
}

export default function TalkLayout({ children }: { children: ReactNode }) {
  return children
}
