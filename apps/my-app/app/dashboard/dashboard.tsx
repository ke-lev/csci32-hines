'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'

export function Dashboard() {
  const { isHydrated, signOut, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/welcome/')
    }
  }, [isHydrated, router, user])

  const handleSignOut = () => {
    signOut()
    router.replace('/welcome/')
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'dashboard', href: '/dashboard/' },
      ]}
      titleId="dashboard-title"
      left={
        <PageIntro
          body="your token is attached to future GraphQL requests until you sign out"
          subhead="credentials checked. door unlocked."
          title={
            <>
              <span className="block">you&apos;re</span>
              <span className="block translate-x-2">in.</span>
            </>
          }
          titleId="dashboard-title"
        />
      }
      right={
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-line px-[clamp(18px,2vw,28px)] py-5">
            <p className="m-0 font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">session</p>
            <h2 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              account details
            </h2>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center px-[clamp(18px,3vw,48px)] py-7">
            {!isHydrated || !user ? (
              <p className="font-mono text-sm tracking-[0.08em] text-muted lowercase">checking credentials...</p>
            ) : (
              <dl className="divide-y divide-line border-y border-line">
                <div className="grid grid-cols-[6rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">name</dt>
                  <dd className="min-w-0 break-words">{user.name || 'not supplied'}</dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">email</dt>
                  <dd className="min-w-0 break-words">{user.email || 'not supplied'}</dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">user id</dt>
                  <dd className="min-w-0 break-all font-mono text-sm">{user.user_id}</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="flex justify-end border-t border-line px-[clamp(18px,2vw,28px)] py-4">
            <Button onClick={handleSignOut} size={Size.MEDIUM} variant={Variant.SECONDARY}>
              sign out
            </Button>
          </div>
        </div>
      }
      rightInset={false}
    />
  )
}
