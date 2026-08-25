import type { Metadata } from 'next'
import { UsersTerminal } from './users-terminal'

export const metadata: Metadata = {
  title: "shell | git'n init",
  description: 'A tiny shell for curious users.',
}

export default function UsersPage() {
  return <UsersTerminal />
}
