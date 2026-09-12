'use client'

import { useSyncExternalStore } from 'react'

const subscribeToTimeZone = () => () => {}
const getClientTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
const getServerTimeZone = () => 'UTC'

export function formatChangelogTimestamp(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    timeZone,
    timeZoneName: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}

export function ChangelogTimestamp({ timestamp }: { timestamp: string }) {
  const timeZone = useSyncExternalStore(subscribeToTimeZone, getClientTimeZone, getServerTimeZone)
  const label = formatChangelogTimestamp(timestamp, timeZone)

  return (
    <time className="text-muted tabular-nums" dateTime={timestamp}>
      {label}
    </time>
  )
}
