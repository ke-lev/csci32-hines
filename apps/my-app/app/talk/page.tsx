'use client'

import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'
import { Room } from './room'

const pageInfo = [
  '/talk',
  'the newest room page is fetched when you arrive, then a cursor asks for only newer lines every five seconds. every sixth poll rereads the latest page so a line removed by moderation also disappears from rooms that were already open.',
  '**one shared room:** messages are public and chronological. there are deliberately no direct messages or threads, so every reply belongs to the same transcript.',
  '**posting limit:** each account can send 10 messages per 60-second window. the counter lives in the backend process and resets when that process restarts.',
]

export default function TalkPage() {
  const { isHydrated, isSessionChecked, user } = useAuth()
  const canPost = isHydrated && isSessionChecked && Boolean(user)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'talk', href: '/talk/' },
      ]}
      info={pageInfo}
      titleId="talk-title"
      left={
        <PageIntro
          body="anyone can read it. an account is what lets you answer."
          subhead="one room, no dms, no threads"
          title={'say\nsomething'}
          titleId="talk-title"
        />
      }
      right={<Room canPost={canPost} />}
      rightInset={false}
    />
  )
}
