import type { Metadata } from 'next'
import { AuthForm } from '../components/auth-form'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'

export const metadata: Metadata = {
  title: 'welcome',
  description: 'Sign in or create an account through the GraphQL backend.',
  alternates: { canonical: '/welcome/' },
}

const pageInfo = [
  '/welcome',
  'signup sends the form to the GraphQL backend, where the password is validated and stored only as a bcrypt hash. signin compares against that hash and returns a signed JWT.',
  '**your session:** the browser keeps the token and public account fields together in localStorage, then sends the token as a bearer header on authenticated GraphQL requests. the backend verifies it and reloads the account before trusting the session.',
]

export default function WelcomePage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'welcome', href: '/welcome/' },
      ]}
      info={pageInfo}
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
