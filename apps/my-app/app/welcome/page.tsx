import type { Metadata } from 'next'
import { AuthForm } from '../components/auth-form'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'

export const metadata: Metadata = {
  title: 'welcome',
  description: 'A working authentication form with a temporary fake account behind it.',
  alternates: { canonical: '/welcome/' },
}

export default function WelcomePage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'welcome', href: '/welcome/' },
      ]}
      titleId="welcome-title"
      left={
        <PageIntro
          body={'this door is just painted on for now'}
          subhead="you new here or what?"
          title={
            <>
              <span className="block">who goes</span>
              <span className="block translate-x-2">there?</span>
            </>
          }
          titleId="welcome-title"
        />
      }
      right={<AuthForm />}
      rightInset={false}
    />
  )
}
