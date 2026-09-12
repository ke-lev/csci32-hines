'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { ROOM_MESSAGES_QUERY } from '../talk/use-room'
import { controlClasses, interactiveRowClasses, noticeClasses, rowClasses, toolbarClasses } from './console-styles'
import { TalkPanel } from './talk-panel'
import { TIP_IDEAS_QUERY, TipsPanel } from './tips-panel'

type AccessState = 'checking' | 'granted' | 'denied'
type ConsoleUser = { user_id: string; username: string }
type UsersState = 'idle' | 'loaded' | 'error'
type TabId = 'routes' | 'posts' | 'users' | 'tips' | 'talk'

export type ConsolePost = {
  dateLabel: string
  slug: string
  title: string
}

type AdminConsoleProps = {
  posts: ConsolePost[]
}

const routes = [
  { path: '/', label: 'home', access: 'public' },
  { path: '/buttons/', label: 'buttons', access: 'public' },
  { path: '/input/', label: 'input', access: 'public' },
  { path: '/input/roll/', label: 'roll call', access: 'public' },
  { path: '/games/', label: 'games', access: 'public' },
  { path: '/games/random-number-guesser/', label: 'number guesser', access: 'public' },
  { path: '/games/game-of-life/', label: 'game of life', access: 'public' },
  { path: '/timeline/', label: 'timeline', access: 'public' },
  { path: '/users/', label: 'users shell', access: 'unlisted' },
  { path: '/admin/', label: 'admin', access: 'root' },
]

const tabOrder: TabId[] = ['routes', 'posts', 'users', 'tips', 'talk']

// One request for the page and its total: a count fetched separately can disagree with the
// rows beside it, which is how pagers end up offering a "next" that lands on nothing.
const FIND_MANY_USERS_QUERY = graphql(`
  query FindManyUsers($params: FindManyUsersInput) {
    findManyUsers(params: $params) {
      user_id
      username
    }
    totalUsers(params: $params)
  }
`)

const USERS_PAGE_SIZE = 10
const TALK_COUNT_PAGE_SIZE = 50

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function AdminConsole({ posts }: AdminConsoleProps) {
  const router = useRouter()
  const { isAdmin, isHydrated, isSessionChecked, signOut } = useAuth()
  const [access, setAccess] = useState<AccessState>('checking')
  const [canScrollAdmin, setCanScrollAdmin] = useState(false)
  const [users, setUsers] = useState<ConsoleUser[]>([])
  const [usersState, setUsersState] = useState<UsersState>('idle')
  const [userCount, setUserCount] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userPage, setUserPage] = useState(0)
  const [userSort, setUserSort] = useState<'ASC' | 'DESC'>('ASC')
  const [activeTab, setActiveTab] = useState<TabId>('routes')
  const [tipsCount, setTipsCount] = useState<number | null>(null)
  const [talkCount, setTalkCount] = useState<number | null>(null)
  const adminScrollRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({})

  useEffect(() => {
    // deferred to a frame so the first client render still matches the server's
    // ('checking') output — avoids a hydration mismatch on this session-derived state
    const accessFrame = window.requestAnimationFrame(() => {
      setAccess(!isHydrated || !isSessionChecked ? 'checking' : isAdmin ? 'granted' : 'denied')
    })

    return () => window.cancelAnimationFrame(accessFrame)
  }, [isAdmin, isHydrated, isSessionChecked])

  // Every keystroke would otherwise be its own round trip. Hold them for a beat, then send one
  // query for the settled phrase — and go back to page 1, since page 4 of the old result set
  // says nothing about the new one.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUserQuery(userSearch.trim())
      setUserPage(0)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [userSearch])

  useEffect(() => {
    if (access !== 'granted') return

    let cancelled = false

    const tipsRequest = gqlClient.request(TIP_IDEAS_QUERY).then((result) => {
      if (!cancelled) setTipsCount(result.findManyTipIdeas.length)
    })
    const talkRequest = gqlClient.request(ROOM_MESSAGES_QUERY, { limit: TALK_COUNT_PAGE_SIZE }).then((result) => {
      if (!cancelled) setTalkCount(result.roomMessages.length)
    })

    // Counts are independent: one unavailable inbox should not keep the other metric blank.
    void Promise.allSettled([tipsRequest, talkRequest])

    return () => {
      cancelled = true
    }
  }, [access])

  useEffect(() => {
    if (access !== 'granted') return

    let cancelled = false

    gqlClient
      .request(FIND_MANY_USERS_QUERY, {
        params: {
          skip: userPage * USERS_PAGE_SIZE,
          take: USERS_PAGE_SIZE,
          sortColumn: 'USERNAME',
          sortDirection: userSort,
          filters: { query: userQuery },
        },
      })
      .then((result) => {
        if (cancelled) return
        setUsers(result.findManyUsers)
        setUserCount(result.totalUsers)
        setUsersState('loaded')
      })
      .catch(() => {
        if (!cancelled) setUsersState('error')
      })

    return () => {
      cancelled = true
    }
  }, [access, userPage, userQuery, userSort])

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
    // activeTab is a dependency because each panel is a different height
  }, [access, activeTab])

  function endSession() {
    signOut()
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

  // arrow keys move between tabs and carry focus with them, per the tabs pattern
  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (offset === 0) return

    event.preventDefault()
    const nextTab = tabOrder[(tabOrder.indexOf(activeTab) + offset + tabOrder.length) % tabOrder.length]
    setActiveTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  const isGranted = access === 'granted'
  const firstUserRow = userPage * USERS_PAGE_SIZE + 1
  const lastUserRow = userPage * USERS_PAGE_SIZE + users.length
  const hasNextUserPage = (userPage + 1) * USERS_PAGE_SIZE < userCount
  const tabs: { id: TabId; label: string; value: string }[] = [
    { id: 'routes', label: 'routes', value: pad(routes.length) },
    { id: 'posts', label: 'posts', value: pad(posts.length) },
    { id: 'users', label: 'users', value: usersState === 'loaded' ? pad(userCount) : '--' },
    { id: 'tips', label: 'tips', value: tipsCount === null ? '--' : pad(tipsCount) },
    { id: 'talk', label: 'talk', value: talkCount === null ? '--' : pad(talkCount) },
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
          title={
            <>
              admin
              <br />
              console
            </>
          }
          titleId="admin-title"
          subhead={isGranted ? 'welcome root' : 'admin role required'}
          subheadAs={isGranted ? 'h2' : 'p'}
          body={
            isGranted
              ? 'site overview\nuser lookup\ntips view\nchat moderation'
              : 'this route expects an admin session.'
          }
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
            <h2 className="mt-7 text-xl font-semibold tracking-[-0.03em]">admin role required</h2>
            <p className="mt-3 max-w-[34ch] text-sm leading-6 text-muted">
              this console is limited to accounts with the Admin role. sign in as one from the shell.
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
          <section className="relative flex min-h-0 flex-1 flex-col">
            <header className="flex h-11 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
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
              <div
                className="grid grid-cols-5 gap-px border-b border-line bg-line"
                role="tablist"
                aria-label="Console sections"
              >
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab

                  return (
                    <button
                      className={`relative px-2 py-5 text-left transition-colors duration-180 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-4 motion-reduce:transition-none ${
                        isActive ? 'bg-row-hover' : 'bg-background hover:bg-row-hover'
                      }`}
                      id={`admin-tab-${tab.id}`}
                      key={tab.id}
                      ref={(node) => {
                        tabRefs.current[tab.id] = node
                      }}
                      type="button"
                      role="tab"
                      aria-controls={`admin-panel-${tab.id}`}
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={handleTabKeyDown}
                    >
                      <span
                        className={`block font-mono text-[0.64rem] tracking-[0.05em] ${isActive ? 'text-foreground' : 'text-muted'}`}
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`mt-3 block font-mono text-2xl leading-none font-medium tabular-nums ${isActive ? 'text-foreground' : 'text-muted'}`}
                      >
                        {tab.value}
                      </span>
                      <span
                        className={`absolute inset-x-0 bottom-0 h-px ${isActive ? 'bg-accent' : 'bg-transparent'}`}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              <div aria-labelledby={`admin-tab-${activeTab}`} id={`admin-panel-${activeTab}`} role="tabpanel">
                {activeTab === 'routes' &&
                  routes.map((route) => (
                    <button
                      className={`${interactiveRowClasses} grid-cols-[minmax(0,1fr)_auto_auto]`}
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

                {activeTab === 'posts' &&
                  (posts.length === 0 ? (
                    <p className={noticeClasses}>no timeline posts found</p>
                  ) : (
                    posts.map((post) => (
                      <button
                        className={`${interactiveRowClasses} grid-cols-[auto_minmax(0,1fr)_auto]`}
                        key={post.slug}
                        type="button"
                        onClick={() => router.push(`/timeline/${post.slug}/`)}
                      >
                        <span className="font-mono text-[0.68rem] text-foreground">{post.slug}</span>
                        <span className="truncate text-xs text-muted">{post.title}</span>
                        <span className="font-mono text-[0.64rem] tabular-nums text-muted">{post.dateLabel}</span>
                      </button>
                    ))
                  ))}

                {activeTab === 'users' && (
                  <>
                    <div className={toolbarClasses}>
                      <input
                        aria-label="Filter users by username or email"
                        className="min-w-[14ch] flex-1 rounded-xs border border-line bg-background px-2.5 py-1.5 font-mono text-[0.68rem] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none focus-visible:outline-none"
                        placeholder="filter username or email…"
                        type="search"
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                      />
                      <button
                        className={controlClasses}
                        type="button"
                        aria-label={`Sort by username, currently ${userSort === 'ASC' ? 'ascending' : 'descending'}`}
                        onClick={() => {
                          setUserSort(userSort === 'ASC' ? 'DESC' : 'ASC')
                          setUserPage(0)
                        }}
                      >
                        username {userSort === 'ASC' ? '↑' : '↓'}
                      </button>
                    </div>

                    {usersState === 'idle' ? (
                      <p className={noticeClasses}>loading users…</p>
                    ) : usersState === 'error' ? (
                      <p className={noticeClasses}>could not load users</p>
                    ) : users.length === 0 ? (
                      <p className={noticeClasses}>{userQuery ? `no users match “${userQuery}”` : 'no users found'}</p>
                    ) : (
                      users.map((consoleUser) => (
                        <div className={`${rowClasses} grid-cols-[minmax(0,1fr)_auto]`} key={consoleUser.user_id}>
                          <span className="truncate font-mono text-[0.68rem] text-foreground">
                            {consoleUser.username}
                          </span>
                          <span className="truncate font-mono text-[0.64rem] text-muted">{consoleUser.user_id}</span>
                        </div>
                      ))
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-line px-[clamp(18px,2vw,28px)] py-3">
                      <p className="m-0 font-mono text-[0.64rem] tracking-[0.05em] text-muted" aria-live="polite">
                        {userCount === 0 ? 'no results' : `${firstUserRow}–${lastUserRow} of ${userCount}`}
                      </p>
                      <div className="flex gap-2">
                        <button
                          className={controlClasses}
                          type="button"
                          disabled={userPage === 0}
                          onClick={() => setUserPage(userPage - 1)}
                        >
                          prev
                        </button>
                        <button
                          className={controlClasses}
                          type="button"
                          disabled={!hasNextUserPage}
                          onClick={() => setUserPage(userPage + 1)}
                        >
                          next
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'tips' && <TipsPanel onCountChange={setTipsCount} />}

                {activeTab === 'talk' && <TalkPanel onCountChange={setTalkCount} />}
              </div>
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
