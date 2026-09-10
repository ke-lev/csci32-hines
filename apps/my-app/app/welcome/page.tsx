import type { Metadata } from 'next'
import { AuthForm } from '../components/auth-form'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'

export const metadata: Metadata = {
  title: 'welcome',
  description: 'Sign in or create an account through the GraphQL backend.',
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
          body="create an account or sign back in. try not to forget your password"
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
