import type { Metadata } from 'next'
import { AdminConsole } from './admin-console'

export const metadata: Metadata = {
  title: 'admin console | kelev',
  description: "here's the real stats, chief",
}

export default function AdminPage() {
  return <AdminConsole />
}
