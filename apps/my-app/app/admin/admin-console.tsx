'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { readSessionStats, type SessionStats } from '../lib/session-stats'

type AccessState = 'checking' | 'granted' | 'denied'

type AdminConsoleProps = {
  timelinePostCount: number
}

const routes = [
  { path: '/', label: 'home', access: 'public' },
  { path: '/buttons/', label: 'buttons', access: 'public' },
  { path: '/input/', label: 'input', access: 'public' },
  { path: '/games/', label: 'games', access: 'public' },
  { path: '/games/random-number-guesser/', label: 'number guesser', access: 'public' },
  { path: '/games/game-of-life/', label: 'game of life', access: 'public' },
  { path: '/input/roll/', label: 'roll call', access: 'public' },
  { path: '/timeline/', label: 'timeline', access: 'public' },
  { path: '/users/', label: 'users shell', access: 'unlisted' },
  { path: '/admin/', label: 'admin', access: 'root' },
]

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function AdminConsole({ timelinePostCount }: AdminConsoleProps) {
  const router = useRouter()
  const [access, setAccess] = useState<AccessState>('checking')
  const [sessionStats, setSessionStats] = useState<SessionStats>({ commands: 0, snakeBest: 0 })
  const [guestShellEnabled, setGuestShellEnabled] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [canScrollAdmin, setCanScrollAdmin] = useState(false)
  const adminScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const accessFrame = window.requestAnimationFrame(() => {
      setAccess(window.sessionStorage.getItem('kelev-admin') === 'root' ? 'granted' : 'denied')
      setSessionStats(readSessionStats())
    })

    return () => window.cancelAnimationFrame(accessFrame)
  }, [])

  useEffect(() => {
    if (access !== 'granted') return

    const panel = adminScrollRef.current
    if (!panel) return
    const scrollPanel = panel

    function updateScrollHint() {
      setCanScrollAdmin(scrollPanel.scrollTop + scrollPanel.clientHeight < scrollPanel.scrollHeight - 2)
    }

    updateScrollHint()
    const resizeObserver = new ResizeObserver(updateScrollHint)
    resizeObserver.observe(scrollPanel)

    return () => resizeObserver.disconnect()
  }, [access])

  function endSession() {
    window.sessionStorage.removeItem('kelev-admin')
    router.push('/')
  }

  function scrollAdminDown() {
    const panel = adminScrollRef.current
    if (!panel) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panel.scrollBy({
      top: panel.clientHeight * 0.72,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const isGranted = access === 'granted'
  const metrics = [
    { label: 'routes', value: pad(routes.length) },
    { label: 'timeline posts', value: pad(timelinePostCount) },
    { label: 'commands run', value: pad(sessionStats.commands) },
    { label: 'snake best', value: pad(sessionStats.snakeBest) },
    { label: 'local sessions', value: '01' },
    { label: 'tracked visitors', value: '00' },
  ]

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'admin', href: '/admin/' },
      ]}
      rightInset={false}
      titleId="admin-title"
      left={
        <PageIntro
          title="admin console"
          titleId="admin-title"
          subhead={isGranted ? 'freshly produced data for the one true admin' : 'this route expects a root session.'}
          body={isGranted ? 'these stats are only tab aware\nyou can literally get all this from the shell' : undefined}
        />
      }
      right={
        access === 'checking' ? (
          <section className="flex min-h-0 flex-1 items-center justify-center px-8 text-center" aria-live="polite">
            <p className="font-mono text-[0.68rem] tracking-[0.08em] text-muted">checking session policy…</p>
          </section>
        ) : access === 'denied' ? (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="m-0 font-mono text-[clamp(3.5rem,7vw,5.5rem)] leading-none font-medium tracking-[-0.04em]">
              403
            </p>
            <h2 className="mt-7 text-xl font-semibold tracking-[-0.03em]">root session required</h2>
            <p className="mt-3 max-w-[34ch] text-sm leading-6 text-muted">
              direct access is disabled for the bit. elevate through the terminal first.
            </p>
            <button
              className="mt-8 rounded-full border border-foreground bg-foreground px-4 py-2.5 font-mono text-[0.68rem] font-[650] tracking-[0.04em] text-background transition-transform duration-180 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              type="button"
              onClick={() => router.push('/users/')}
            >
              open users shell
            </button>
          </section>
        ) : (
          <section className="relative flex min-h-0 flex-1 flex-col" aria-label="Admin control plane">
            <header className="flex min-h-14 items-center justify-between gap-4 border-b border-line px-[clamp(18px,2vw,28px)]">
              <p className="m-0 flex items-center gap-2.5 font-mono text-[0.68rem] font-[650] tracking-[0.06em]">
                <span
                  className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]"
                  aria-hidden="true"
                />
                root@kelev
              </p>
              <button
                className="font-mono text-[0.68rem] font-[650] tracking-[0.04em] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-foreground focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                type="button"
                onClick={endSession}
              >
                end session
              </button>
            </header>

            <div
              className="terminal-log min-h-0 flex-1 overflow-y-auto"
              ref={adminScrollRef}
              onScroll={() => {
                const panel = adminScrollRef.current
                if (panel) {
                  setCanScrollAdmin(panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2)
                }
              }}
            >
              <section
                className="grid grid-cols-3 gap-px border-b border-line bg-line max-[560px]:grid-cols-2"
                aria-label="System overview"
              >
                {metrics.map((metric) => (
                  <div className="bg-background px-4 py-5" key={metric.label}>
                    <p className="m-0 font-mono text-[0.64rem] tracking-[0.05em] text-muted">{metric.label}</p>
                    <p className="mt-3 font-mono text-2xl leading-none font-medium tabular-nums">{metric.value}</p>
                  </div>
                ))}
              </section>

              <section className="border-b border-line py-2" aria-labelledby="routes-heading">
                <div className="flex items-center justify-between px-[clamp(18px,2vw,28px)] py-4">
                  <h2 className="m-0 text-sm font-semibold tracking-[-0.02em]" id="routes-heading">
                    routes
                  </h2>
                  <span className="font-mono text-[0.64rem] tracking-[0.05em] text-muted">{routes.length} mounted</span>
                </div>
                <div className="border-t border-line">
                  {routes.map((route) => (
                    <button
                      className="group grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-line px-[clamp(18px,2vw,28px)] py-3.5 text-left last:border-b-0 transition-colors duration-180 hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                      key={route.path}
                      type="button"
                      onClick={() => router.push(route.path)}
                    >
                      <span className="truncate font-mono text-[0.68rem] text-foreground">{route.path}</span>
                      <span className="text-xs text-muted">{route.label}</span>
                      <span
                        className={`font-mono text-[0.64rem] ${route.access === 'root' ? 'text-accent' : 'text-muted'}`}
                      >
                        {route.access}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="py-2" aria-labelledby="access-heading">
                <div className="flex items-center justify-between px-[clamp(18px,2vw,28px)] py-4">
                  <h2 className="m-0 text-sm font-semibold tracking-[-0.02em]" id="access-heading">
                    access controls
                  </h2>
                  <span className="font-mono text-[0.64rem] tracking-[0.05em] text-muted">local simulation</span>
                </div>
                <div className="border-t border-line">
                  <SettingRow
                    checked={guestShellEnabled}
                    description="allow the unlisted users terminal to accept commands"
                    label="guest shell"
                    onChange={setGuestShellEnabled}
                  />
                  <SettingRow
                    checked={maintenanceMode}
                    description="pretend public routes are undergoing maintenance"
                    label="maintenance mode"
                    onChange={setMaintenanceMode}
                  />
                  <div className="flex items-center justify-between gap-6 px-[clamp(18px,2vw,28px)] py-4">
                    <div>
                      <p className="m-0 text-sm font-medium">visitor telemetry</p>
                      <p className="mt-1.5 text-xs leading-5 text-muted">no analytics provider is connected</p>
                    </div>
                    <span className="font-mono text-[0.64rem] tracking-[0.05em] text-muted">disabled</span>
                  </div>
                </div>
              </section>
            </div>

            <button
              className={`group absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-line bg-background text-foreground transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none ${
                canScrollAdmin ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
              }`}
              type="button"
              aria-label="Scroll down in the admin console"
              disabled={!canScrollAdmin}
              onClick={scrollAdminDown}
            >
              <svg
                className="size-4 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7.5 10 13l6-5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </section>
        )
      }
    />
  )
}

type SettingRowProps = {
  checked: boolean
  description: string
  label: string
  onChange: (checked: boolean) => void
}

function SettingRow({ checked, description, label, onChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line px-[clamp(18px,2vw,28px)] py-4">
      <div>
        <p className="m-0 text-sm font-medium">{label}</p>
        <p className="mt-1.5 text-xs leading-5 text-muted">{description}</p>
      </div>
      <button
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-180 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none ${checked ? 'border-foreground bg-foreground' : 'border-line bg-background'}`}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
      >
        {/* left-anchored: without it the knob starts from the button's centered static position */}
        <span
          className={`absolute top-1/2 left-0.5 size-4 -translate-y-1/2 rounded-full transition-transform duration-180 motion-reduce:transition-none ${checked ? 'translate-x-5.5 bg-background' : 'translate-x-0 bg-muted'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
