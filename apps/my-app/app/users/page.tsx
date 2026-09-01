import type { Metadata } from 'next'
import { UsersTerminal } from './users-terminal'

export const metadata: Metadata = {
  title: 'shell',
  description: 'A tiny shell for curious users.',
  alternates: { canonical: '/users/' },
}

export default function UsersPage() {
  return <UsersTerminal />
}
