import type { Metadata } from 'next'
import { Dashboard } from './dashboard'

export const metadata: Metadata = {
  title: 'dashboard',
  description: 'Your signed-in account details.',
  robots: { follow: false, index: false },
}

export default function DashboardPage() {
  return <Dashboard />
}
