import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'

const sections = [
  {
    title: 'lorem ipsum',
    body: 'dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    title: 'dolor sit amet',
    body: 'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    title: 'consectetur',
    body: 'duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
]

export default function ButtonsPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'buttons', href: '/buttons/' },
      ]}
      titleId="buttons-title"
      left={
        <PageIntro
          title="buttons"
          titleId="buttons-title"
          subhead="lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          body="ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        />
      }
      right={
        <div className="flex flex-1 flex-col">
          {sections.map((section) => (
            <section
              className="flex min-h-32 flex-1 flex-col items-end justify-center gap-3.5 border-b border-line px-[clamp(18px,2vw,28px)] py-6 text-right last:border-b-0"
              key={section.title}
            >
              <h2 className="m-0 text-[clamp(1.25rem,1.8vw,1.6rem)] font-[520] tracking-[-0.03em]">
                {section.title}
              </h2>
              <p className="m-0 max-w-[42ch] text-[0.88rem] leading-6 text-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      }
    />
  )
}
