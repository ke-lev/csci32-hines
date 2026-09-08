'use client'

import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'
import { Room } from './room'

export default function TalkPage() {
  const { isHydrated, isSessionChecked, user } = useAuth()
  const canPost = isHydrated && isSessionChecked && Boolean(user)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'talk', href: '/talk/' },
      ]}
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
