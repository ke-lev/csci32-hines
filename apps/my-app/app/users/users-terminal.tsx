'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getButtonSizeStyles, Size } from '@repo/ui/size'
import { getVariantBackgroundStyles, Variant } from '@repo/ui/variant'
import { ClientError } from 'graphql-request'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { validateSignupField } from '../components/auth-validation'
import { landingRoute, useAuth } from '../components/use-auth'
import { useReactorMeltdown } from '../components/use-reactor-meltdown'
import { countCommand, recordSnakeScore } from '../lib/session-stats'
import { getTerminalListing, getTerminalTree, getVisibleSiteRoutes, resolveSiteRoute } from '../lib/site-routes'
import { gqlClient } from '../services/graphql-client'
import { readTimelinePost } from '../timeline/read-post'
import { graphql } from '../generated/gql'
import { ROOM_MESSAGES_QUERY } from '../talk/use-room'

type Line = {
  id: number
  links?: { href: string; label: string }[]
  kind: 'command' | 'output' | 'muted' | 'accent' | 'error'
  text: string
}

type PromptState =
  | { kind: 'command' }
  | { kind: 'login-username' }
  | { kind: 'login-password'; username: string }
  | { kind: 'signup-username' }
  | { kind: 'signup-email'; username: string }
  | { kind: 'signup-password'; email: string; username: string }

type Direction = 'up' | 'down' | 'left' | 'right'

type Point = {
  x: number
  y: number
}

type SnakeGame = {
  body: Point[]
  food: Point
  score: number
  status: 'running' | 'game-over'
}

const boardWidth = 28
const boardHeight = 14

const directionVectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const oppositeDirections: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

function samePoint(first: Point, second: Point) {
  return first.x === second.x && first.y === second.y
}

function createSnakeGame(): SnakeGame {
  return {
    body: [
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 },
    ],
    food: { x: 19, y: 7 },
    score: 0,
    status: 'running',
  }
}

function placeFood(body: Point[]) {
  const available: Point[] = []

  for (let y = 0; y < boardHeight; y += 1) {
    for (let x = 0; x < boardWidth; x += 1) {
      const point = { x, y }
      if (!body.some((segment) => samePoint(segment, point))) {
        available.push(point)
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)] ?? { x: 0, y: 0 }
}

const guestCommands = [
  'help',
  'login',
  'signup',
  'ideas',
  'talk',
  'logout',
  'whoami',
  'pwd',
  'ls',
  'tree',
  'snake',
  'open',
  'admin',
  'cat timeline/9-7',
  'history',
  'clear',
  'exit',
]

// Narration for the sign-in round trip, which is long enough that a silent terminal reads as
// broken. Every step is real work: the API call, the bcrypt compare at 10 rounds (seedUsers.ts),
// and the role/permission lookup.
const authSteps = [
  '==> resolving kelev-backend:4000',
  '==> verifying credentials (bcrypt, 10 rounds)',
  '==> fetching role bindings',
]
const authStepDurationMs = 150
const authTickMs = 60
const authBarWidth = 44
// The bar has no idea how long the request has left, so it eases toward a ceiling it never
// reaches on its own. Only a request that actually came back gets to draw a full bar.
const authBarCeiling = 0.96
const authBarEaseMs = 380

const pageInfo = [
  '/users',
  'the shell recognizes a small command grammar rather than handing input to a real operating system. help, navigation, account flows, history, the snake game, and a few site-specific commands are implemented here; the boot text and filesystem framing are set dressing.',
  '**real commands:** login and signup call the GraphQL backend, route commands navigate the site, and timeline reads fetch actual posts. ls and tree are generated from the same route registry used by open.',
  '**room tail:** the talk command reads the shared room through the same cursor query as /talk, so those lines are real too.',
]

function renderAuthBar(ratio: number) {
  const filled = Math.round(authBarWidth * ratio)
  const percent = `${(ratio * 100).toFixed(1)}%`.padStart(7)

  return `${'#'.repeat(filled)}${' '.repeat(authBarWidth - filled)}${percent}`
}

const initialLines: Line[] = [
  { id: 1, kind: 'muted', text: 'last login: just now on ttys001' },
  { id: 2, kind: 'muted', text: 'login / signup, or type help for a list of commands' },
]

const TIP_IDEAS_QUERY = graphql(`
  query TipIdeas {
    findManyTipIdeas {
      body
      createdAt
      receipt
      shippedHref
      status
    }
  }
`)

const UPDATE_TIP_IDEA_MUTATION = graphql(`
  mutation UpdateTipIdea($input: UpdateTipIdeaInput!) {
    updateTipIdea(input: $input) {
      body
      createdAt
      receipt
      shippedHref
      status
    }
  }
`)

// stays a Link for client-side navigation, but borrows the shared button's size and variant
const exitLinkClasses = [
  'mt-8 inline-flex items-center justify-center rounded-full border font-mono leading-none font-semibold no-underline',
  getButtonSizeStyles(Size.MEDIUM),
  getVariantBackgroundStyles(Variant.PRIMARY),
  'transition-transform duration-180 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0',
].join(' ')

export function UsersTerminal() {
  const router = useRouter()
  const {
    clearError,
    getLastError,
    isAdmin,
    isHydrated,
    isLoading,
    isSessionChecked,
    permissions,
    recoverSession,
    signIn,
    signOut,
    signUp,
    user,
  } = useAuth()
  const meltdown = useReactorMeltdown()
  const meltdownTimerRef = useRef<number | null>(null)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [promptState, setPromptState] = useState<PromptState>({ kind: 'command' })
  const [snakeActive, setSnakeActive] = useState(false)
  const [snakeGame, setSnakeGame] = useState<SnakeGame>(createSnakeGame)
  const nextId = useRef(3)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<Direction>('right')
  const authTickerRef = useRef<number | null>(null)
  const queuedDirectionRef = useRef<Direction>('right')
  const terminalUser = isHydrated && isSessionChecked ? user : null
  const identity = terminalUser?.username || terminalUser?.email || 'guest'
  const prompt = `${identity}@kelev ~ /users %`

  const promptLabel =
    promptState.kind === 'command'
      ? prompt
      : promptState.kind === 'login-username' || promptState.kind === 'signup-username'
        ? 'username:'
        : promptState.kind === 'signup-email'
          ? 'email:'
          : 'password:'

  useEffect(() => {
    const log = logRef.current
    if (log) {
      log.scrollTop = log.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    if (!snakeActive) return

    const focusFrame = window.requestAnimationFrame(() => gameRef.current?.focus())
    return () => window.cancelAnimationFrame(focusFrame)
  }, [snakeActive])

  useEffect(() => {
    if (!snakeActive || snakeGame.status !== 'running') return

    const gameLoop = window.setInterval(() => {
      setSnakeGame((current) => {
        const direction = queuedDirectionRef.current
        directionRef.current = direction
        const vector = directionVectors[direction]
        const head = current.body[0]
        const nextHead = { x: head.x + vector.x, y: head.y + vector.y }
        const ateFood = samePoint(nextHead, current.food)
        const collisionBody = ateFood ? current.body : current.body.slice(0, -1)
        const hitWall = nextHead.x < 0 || nextHead.x >= boardWidth || nextHead.y < 0 || nextHead.y >= boardHeight
        const hitSelf = collisionBody.some((segment) => samePoint(segment, nextHead))

        if (hitWall || hitSelf) {
          return { ...current, status: 'game-over' }
        }

        const nextBody = [nextHead, ...current.body]
        if (!ateFood) nextBody.pop()

        return {
          body: nextBody,
          food: ateFood ? placeFood(nextBody) : current.food,
          score: current.score + (ateFood ? 1 : 0),
          status: 'running',
        }
      })
    }, 125)

    return () => window.clearInterval(gameLoop)
  }, [snakeActive, snakeGame.status])

  useEffect(() => {
    if (snakeGame.status === 'game-over') recordSnakeScore(snakeGame.score)
  }, [snakeGame.score, snakeGame.status])

  useEffect(() => {
    return () => {
      if (meltdownTimerRef.current) window.clearTimeout(meltdownTimerRef.current)
      if (authTickerRef.current) window.clearInterval(authTickerRef.current)
    }
  }, [])

  function append(entries: Omit<Line, 'id'>[]) {
    setLines((current) => [...current, ...entries.map((entry) => ({ ...entry, id: nextId.current++ }))])
  }

  function appendLine(entry: Omit<Line, 'id'>) {
    const id = nextId.current++
    setLines((current) => [...current, { ...entry, id }])
    return id
  }

  function insertLineBefore(anchorId: number, entry: Omit<Line, 'id'>) {
    const id = nextId.current++
    setLines((current) => {
      const index = current.findIndex((line) => line.id === anchorId)
      if (index === -1) return [...current, { ...entry, id }]

      return [...current.slice(0, index), { ...entry, id }, ...current.slice(index)]
    })
    return id
  }

  function setLineText(lineId: number, text: string) {
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, text } : line)))
  }

  // Draws alongside the real request and never outlives it. Steps land on a timer, but the work
  // is never held back to let them finish — if auth returns first, the log stops where it got to,
  // which is also what a download that ended early looks like.
  async function withAuthTicker<T>(work: Promise<T>): Promise<T> {
    const barId = appendLine({ kind: 'output', text: renderAuthBar(0) })
    insertLineBefore(barId, { kind: 'muted', text: authSteps[0] })
    const startedAt = Date.now()
    let shownSteps = 1

    authTickerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const dueSteps = Math.min(Math.floor(elapsed / authStepDurationMs) + 1, authSteps.length)

      while (shownSteps < dueSteps) {
        insertLineBefore(barId, { kind: 'muted', text: authSteps[shownSteps] })
        shownSteps += 1
      }

      setLineText(barId, renderAuthBar(authBarCeiling * (1 - Math.exp(-elapsed / authBarEaseMs))))
    }, authTickMs)

    try {
      const result = await work
      if (result) setLineText(barId, renderAuthBar(1))

      return result
    } finally {
      if (authTickerRef.current) window.clearInterval(authTickerRef.current)
      authTickerRef.current = null
    }
  }

  function describeGrant() {
    return `role=${terminalUser?.role ?? 'none'}  perms=${permissions.length ? permissions.join(',') : 'none'}`
  }

  function openAdminConsole() {
    if (!terminalUser) {
      append([
        { kind: 'error', text: 'admin: not signed in' },
        { kind: 'muted', text: "run 'login' first" },
      ])
      return
    }

    if (!isAdmin) {
      append([
        { kind: 'error', text: `admin: ${identity} does not have the Admin role` },
        { kind: 'muted', text: describeGrant() },
      ])
      return
    }

    append([
      { kind: 'muted', text: describeGrant() },
      { kind: 'accent', text: 'opening admin console…' },
    ])
    window.setTimeout(() => router.push('/admin/'), 520)
  }

  function returnHome() {
    router.push(landingRoute(terminalUser))
  }

  function startSnake() {
    directionRef.current = 'right'
    queuedDirectionRef.current = 'right'
    setSnakeGame(createSnakeGame())
    setSnakeActive(true)
  }

  function stopSnake() {
    setSnakeActive(false)
    recordSnakeScore(snakeGame.score)
    append([{ kind: 'muted', text: `snake exited — score ${snakeGame.score}` }])
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  function queueDirection(direction: Direction) {
    if (oppositeDirections[directionRef.current] !== direction) {
      queuedDirectionRef.current = direction
    }
  }

  function handleSnakeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      returnHome()
      return
    }

    if (event.key === 'Escape' || event.key.toLowerCase() === 'q') {
      event.preventDefault()
      stopSnake()
      return
    }

    if (event.code === 'Space' && snakeGame.status === 'game-over') {
      event.preventDefault()
      startSnake()
      return
    }

    const keyDirections: Record<string, Direction | undefined> = {
      ArrowUp: 'up',
      w: 'up',
      ArrowDown: 'down',
      s: 'down',
      ArrowLeft: 'left',
      a: 'left',
      ArrowRight: 'right',
      d: 'right',
    }
    const direction = keyDirections[event.key]

    if (direction) {
      event.preventDefault()
      queueDirection(direction)
    }
  }

  async function execute(rawCommand: string) {
    const command = rawCommand.trim()
    append([{ kind: 'command', text: `${prompt} ${command}` }])

    if (!command) {
      return
    }

    const nextHistory = [...commandHistory, command]
    setCommandHistory(nextHistory)
    setHistoryIndex(nextHistory.length)
    countCommand()

    if (command === 'exit') {
      returnHome()
      return
    }

    if (command === 'clear') {
      setLines([])
      return
    }

    if (command === 'help') {
      append([
        { kind: 'output', text: guestCommands.join('  ') },
        {
          kind: 'muted',
          links: getVisibleSiteRoutes(Boolean(terminalUser)).map((route) => ({
            href: route.href,
            label: route.command,
          })),
          text: 'destinations: ',
        },
        {
          kind: 'muted',
          text: 'tip: use ↑/↓ for history, ctrl+space to complete, ctrl+l to clear, and ctrl+c to exit',
        },
      ])
      return
    }

    if (command === 'login') {
      if (terminalUser) {
        append([{ kind: 'muted', text: `already logged in as ${identity}` }])
        return
      }

      clearError()
      setPromptState({ kind: 'login-username' })
      return
    }

    if (command === 'signup') {
      if (terminalUser) {
        append([{ kind: 'muted', text: `log out before creating another account` }])
        return
      }

      clearError()
      setPromptState({ kind: 'signup-username' })
      return
    }

    if (command === 'logout') {
      if (!terminalUser) {
        append([{ kind: 'muted', text: 'not logged in' }])
        return
      }

      signOut()
      append([{ kind: 'accent', text: `logged out ${identity}` }])
      return
    }

    if (command === 'whoami') {
      append([
        { kind: 'output', text: identity },
        ...(terminalUser ? [{ kind: 'muted' as const, text: describeGrant() }] : []),
      ])
      return
    }

    if (command === 'pwd') {
      append([{ kind: 'output', text: '/users/kelev' }])
      return
    }

    if (command === 'ls' || command === 'ls -la') {
      append([{ kind: 'output', text: getTerminalListing(Boolean(terminalUser)) }])
      return
    }

    if (command === 'tree' || command === 'tree -L 2') {
      append([{ kind: 'output', text: getTerminalTree(Boolean(terminalUser)) }])
      return
    }

    if (command === 'ideas') {
      if (!terminalUser) {
        append([{ kind: 'error', text: 'ideas: login required' }])
        return
      }

      try {
        const result = await gqlClient.request(TIP_IDEAS_QUERY)
        if (result.findManyTipIdeas.length === 0) {
          append([{ kind: 'muted', text: 'ideas: inbox is empty' }])
          return
        }

        append([
          {
            kind: 'accent',
            text: `${result.findManyTipIdeas.length} suggestion${result.findManyTipIdeas.length === 1 ? '' : 's'}`,
          },
          ...result.findManyTipIdeas.flatMap((idea) => [
            {
              kind: 'output' as const,
              text: `${idea.receipt}  [${idea.status}]  ${idea.body}`,
            },
            {
              kind: 'muted' as const,
              text: `  received ${idea.createdAt}${idea.shippedHref ? `  → ${idea.shippedHref}` : ''}`,
            },
          ]),
        ])
      } catch (caughtError) {
        const code = caughtError instanceof ClientError ? caughtError.response.errors?.[0]?.extensions?.code : undefined
        const sessionExpired = recoverSession(caughtError)
        append([
          {
            kind: 'error',
            text: sessionExpired
              ? 'session expired — log in again'
              : code === 'FORBIDDEN' || code === 'UNAUTHORIZED'
                ? 'ideas: admin role required'
                : 'ideas: could not read the inbox',
          },
        ])
      }
      return
    }

    if (command === 'talk') {
      try {
        const result = await gqlClient.request(ROOM_MESSAGES_QUERY, { limit: 10 })

        if (result.roomMessages.length === 0) {
          append([{ kind: 'muted', text: 'the room is empty' }])
          return
        }

        append(
          result.roomMessages.map((line) =>
            line.kind === 'system'
              ? { kind: 'muted' as const, text: `* ${line.body}` }
              : { kind: 'output' as const, text: `<${line.authorUsername ?? 'someone'}> ${line.body}` },
          ),
        )
      } catch (caughtError) {
        if (recoverSession(caughtError)) {
          append([{ kind: 'error', text: 'session expired — log in again' }])
          return
        }

        append([{ kind: 'error', text: 'talk: could not reach the room' }])
      }

      return
    }

    if (command.startsWith('ideas update ')) {
      if (!terminalUser) {
        append([{ kind: 'error', text: 'ideas: login required' }])
        return
      }

      const [, receipt, requestedStatus, shippedHref] = command.match(/^ideas update (\S+) (\S+)(?: (\S+))?$/) ?? []
      const status = requestedStatus === 'trying' ? 'trying_it' : requestedStatus

      if (!receipt || !status || !['heard', 'trying_it', 'shipped'].includes(status)) {
        append([{ kind: 'error', text: 'usage: ideas update <receipt> <heard|trying|shipped> [site/path]' }])
        return
      }

      try {
        const result = await gqlClient.request(UPDATE_TIP_IDEA_MUTATION, {
          input: { receipt, shippedHref, status },
        })
        append([{ kind: 'accent', text: `${result.updateTipIdea.receipt} is now ${result.updateTipIdea.status}` }])
      } catch (caughtError) {
        const code = caughtError instanceof ClientError ? caughtError.response.errors?.[0]?.extensions?.code : undefined
        const sessionExpired = recoverSession(caughtError)
        append([
          {
            kind: 'error',
            text: sessionExpired
              ? 'session expired — log in again'
              : code === 'FORBIDDEN' || code === 'UNAUTHORIZED'
                ? 'ideas: admin role required'
                : code === 'NOT_FOUND'
                  ? 'ideas: no suggestion found for that receipt'
                  : 'ideas: could not update that suggestion',
          },
        ])
      }
      return
    }

    if (command === 'snake') {
      append([{ kind: 'accent', text: 'snake v1.0.0 — arrows / wasd to move, q to quit' }])
      startSnake()
      return
    }

    if (command === 'admin') {
      openAdminConsole()
      return
    }

    if (command === 'rm -rf /' || command === 'sudo rm -rf /') {
      append([
        { kind: 'muted', text: 'bruh you did not seriously try to delete my website did you?' },
        { kind: 'error', text: 'ohhh shiiittt' },
      ])
      meltdown.trigger(logRef.current)

      meltdownTimerRef.current = window.setTimeout(() => {
        meltdown.reset()
        append([{ kind: 'accent', text: 'filesystem restored from backup' }])
      }, 2400)
      return
    }

    if (command === 'cat README.md') {
      append([
        { kind: 'output', text: "git'n init — a small Next.js workspace for experiments and a semester devlog." },
      ])
      return
    }

    const timelineCat = command.match(/^cat\s+timeline\/(.+)$/)
    if (timelineCat) {
      const requestedSlug = timelineCat[1]
      let result

      try {
        result = await readTimelinePost(requestedSlug)
      } catch {
        append([{ kind: 'error', text: `cat: timeline/${requestedSlug}: could not read that post` }])
        return
      }

      if (!result.ok) {
        append([{ kind: 'error', text: `cat: timeline/${requestedSlug}: ${result.reason}` }])
        return
      }

      append([
        { kind: 'accent', text: `${result.post.title} — ${result.post.dateLabel}` },
        { kind: 'muted', text: result.post.description },
        { kind: 'output', text: result.post.content },
      ])
      return
    }

    if (command === 'history') {
      append([
        {
          kind: 'output',
          text: nextHistory.map((entry, index) => `${String(index + 1).padStart(3, ' ')}  ${entry}`).join('\n'),
        },
      ])
      return
    }

    if (command.startsWith('open ')) {
      const destination = command.slice(5)
      const route = resolveSiteRoute(destination, Boolean(terminalUser))

      if (route) {
        append([{ kind: 'accent', text: `opening ${route.href}` }])
        router.push(route.href)
      } else {
        append([{ kind: 'error', text: `open: route not found: ${destination.trim()}` }])
      }
      return
    }

    append([{ kind: 'error', text: `zsh: command not found: ${command.split(' ')[0]}` }])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = input.trim()
    setInput('')

    if (promptState.kind === 'command') {
      await execute(input)
      return
    }

    if (!response) {
      append([{ kind: 'error', text: `${promptLabel.slice(0, -1)} is required` }])
      return
    }

    if (promptState.kind === 'login-username') {
      append([{ kind: 'output', text: `username: ${response}` }])
      setPromptState({ kind: 'login-password', username: response })
      return
    }

    if (promptState.kind === 'signup-username') {
      const usernameError = validateSignupField('username', response)
      if (usernameError) {
        append([{ kind: 'error', text: usernameError }])
        return
      }

      append([{ kind: 'output', text: `username: ${response}` }])
      setPromptState({ kind: 'signup-email', username: response })
      return
    }

    if (promptState.kind === 'signup-email') {
      const emailError = validateSignupField('email', response)
      if (emailError) {
        append([{ kind: 'error', text: emailError }])
        return
      }

      append([{ kind: 'output', text: `email: ${response}` }])
      setPromptState({ kind: 'signup-password', email: response, username: promptState.username })
      return
    }

    if (promptState.kind === 'login-password') {
      const result = await withAuthTicker(signIn({ username: promptState.username, password: input }))
      if (!result) {
        append([{ kind: 'error', text: '✗ login failed. check your username and password, then try again' }])
        setPromptState({ kind: 'login-username' })
      } else {
        const { permissions: grantedPermissions, role, username } = result.user
        append([
          {
            kind: 'accent',
            text: `✓ signed in as ${username}  role=${role ?? 'none'}  perms=${grantedPermissions.length ? grantedPermissions.join(',') : 'none'}`,
          },
        ])
        setPromptState({ kind: 'command' })
      }
      return
    }

    const passwordError = validateSignupField('password', input)
    if (passwordError) {
      append([{ kind: 'error', text: passwordError }])
      return
    }

    const result = await signUp({
      email: promptState.email,
      password: input,
      username: promptState.username,
    })
    if (!result) {
      const signupError = getLastError()
      const field = signupError?.fieldErrors
      const correctedField = field?.username ? 'username' : field?.email ? 'email' : field?.password ? 'password' : null

      append([{ kind: 'error', text: signupError?.message ?? 'signup failed. check your details, then try again' }])

      if (correctedField === 'username') {
        setPromptState({ kind: 'signup-username' })
      } else if (correctedField === 'email') {
        setPromptState({ kind: 'signup-email', username: promptState.username })
      } else {
        setPromptState({ kind: 'signup-password', email: promptState.email, username: promptState.username })
      }
    } else {
      setPromptState({ kind: 'command' })
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      if (promptState.kind !== 'command') {
        setInput('')
        setPromptState({ kind: 'command' })
        append([{ kind: 'muted', text: '^C' }])
        return
      }
      returnHome()
      return
    }

    if (promptState.kind !== 'command') return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (commandHistory.length === 0) return
      const nextIndex = Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex] ?? '')
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = Math.min(commandHistory.length, historyIndex + 1)
      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex] ?? '')
    }

    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault()
      const matches = guestCommands.filter((command) => command.startsWith(input))
      if (matches.length === 1) {
        setInput(matches[0])
      } else if (matches.length > 1) {
        append([{ kind: 'muted', text: matches.join('  ') }])
      }
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      setLines([])
    }
  }

  const snakeCells = Array.from({ length: boardWidth * boardHeight }, (_, index) => {
    const point = { x: index % boardWidth, y: Math.floor(index / boardWidth) }
    const segmentIndex = snakeGame.body.findIndex((segment) => samePoint(segment, point))

    return {
      index,
      isFood: samePoint(snakeGame.food, point),
      isHead: segmentIndex === 0,
      isSnake: segmentIndex >= 0,
    }
  })

  return (
    <PageShell
      breadcrumbs={[{ label: 'users', href: '/users/' }]}
      info={pageInfo}
      rightInset={false}
      titleId="users-title"
      left={
        <PageIntro title="shell" titleId="users-title" subhead="let's hope you know what you're doing" body="">
          <Link className={exitLinkClasses} href={landingRoute(terminalUser)}>
            get me outta here
          </Link>
        </PageIntro>
      }
      right={
        <section
          className="flex min-h-0 flex-1 flex-col font-mono"
          aria-label="Interactive zsh terminal"
          onClick={() => (snakeActive ? gameRef.current?.focus() : inputRef.current?.focus())}
        >
          <header className="relative grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-surface px-4 text-[0.66rem] font-medium tracking-[-0.01em] text-muted">
            <span className="flex items-center gap-2" aria-hidden="true">
              <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.35)]" />
              <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.35)]" />
              <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.35)]" />
            </span>
            <span className="truncate px-3 text-center">{identity}@kelev: /users — zsh</span>
            <span className="justify-self-end text-footer max-[560px]:hidden">80×24</span>
          </header>

          <div
            className="terminal-log min-h-0 flex-1 overflow-y-auto px-[clamp(18px,2vw,26px)] py-[clamp(18px,2.4vw,28px)] text-[0.78rem] leading-[1.6] max-[560px]:text-sm"
            ref={logRef}
          >
            <div role="log" aria-live="polite" aria-relevant="additions">
              {lines.map((line) => (
                <div
                  className={`whitespace-pre-wrap break-words ${
                    line.kind === 'command'
                      ? 'mt-4 text-foreground first:mt-0'
                      : line.kind === 'muted'
                        ? 'text-muted'
                        : line.kind === 'accent'
                          ? 'text-accent'
                          : line.kind === 'error'
                            ? 'text-danger'
                            : 'text-subhead'
                  }`}
                  data-scramble={line.links ? undefined : true}
                  key={line.id}
                >
                  {line.text}
                  {line.links ? (
                    <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
                      {line.links.map((link) => (
                        <Link
                          className="text-accent underline decoration-line underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          href={link.href}
                          key={link.href}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {snakeActive ? (
              <div
                className="mt-4 outline-none"
                ref={gameRef}
                role="application"
                tabIndex={0}
                aria-label={`Snake game. Score ${snakeGame.score}. Use arrow keys or W A S D to move. Press Q or Escape to quit.`}
                onKeyDown={handleSnakeKeyDown}
              >
                <div className="mb-2 flex items-center justify-between gap-4 text-[0.68rem] tracking-[0.04em]">
                  <span className="text-accent">score {String(snakeGame.score).padStart(3, '0')}</span>
                  <span className={snakeGame.status === 'game-over' ? 'text-danger' : 'text-muted'} aria-live="polite">
                    {snakeGame.status === 'game-over' ? 'game over · space to restart' : 'q / esc to quit'}
                  </span>
                </div>
                <div
                  className="relative grid aspect-2/1 w-full max-w-[520px] gap-px overflow-hidden border border-line bg-background p-1"
                  style={{ gridTemplateColumns: `repeat(${boardWidth}, minmax(0, 1fr))` }}
                  aria-hidden="true"
                >
                  {snakeCells.map((cell) => (
                    <span
                      className={`min-h-0 min-w-0 rounded-[1px] ${
                        cell.isHead
                          ? 'bg-accent'
                          : cell.isSnake
                            ? 'bg-subhead'
                            : cell.isFood
                              ? 'bg-danger'
                              : 'bg-transparent'
                      }`}
                      key={cell.index}
                    />
                  ))}
                  {snakeGame.status === 'game-over' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-[0.72rem] font-semibold tracking-[0.08em] text-foreground">
                      game over
                    </span>
                  )}
                </div>
                <div className="mt-3 hidden grid-cols-3 gap-1.5 max-[560px]:grid" aria-label="Touch controls">
                  <span />
                  <button
                    className="min-h-10 border border-line text-subhead active:bg-row-hover"
                    type="button"
                    onClick={() => queueDirection('up')}
                  >
                    w
                  </button>
                  <span />
                  <button
                    className="min-h-10 border border-line text-subhead active:bg-row-hover"
                    type="button"
                    onClick={() => queueDirection('left')}
                  >
                    a
                  </button>
                  <button
                    className="min-h-10 border border-line text-subhead active:bg-row-hover"
                    type="button"
                    onClick={() => queueDirection('down')}
                  >
                    s
                  </button>
                  <button
                    className="min-h-10 border border-line text-subhead active:bg-row-hover"
                    type="button"
                    onClick={() => queueDirection('right')}
                  >
                    d
                  </button>
                  <button
                    className="col-span-3 min-h-10 border border-line text-muted active:bg-row-hover"
                    type="button"
                    onClick={stopSnake}
                  >
                    q · quit
                  </button>
                </div>
              </div>
            ) : (
              <form className={`flex min-w-0 items-center gap-2 ${lines.length ? 'mt-4' : ''}`} onSubmit={submit}>
                <label className="sr-only" htmlFor="terminal-command">
                  {promptState.kind === 'command' ? 'terminal command' : promptLabel.slice(0, -1)}
                </label>
                <span className="shrink-0 text-foreground" aria-hidden="true">
                  {promptLabel}
                </span>
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[inherit] leading-[inherit] text-foreground caret-accent outline-none max-[560px]:text-base"
                  id="terminal-command"
                  ref={inputRef}
                  type={promptState.kind.endsWith('password') ? 'password' : 'text'}
                  value={input}
                  autoFocus
                  autoComplete={
                    promptState.kind.endsWith('password')
                      ? promptState.kind === 'signup-password'
                        ? 'new-password'
                        : 'current-password'
                      : promptState.kind.endsWith('username')
                        ? 'username'
                        : promptState.kind === 'signup-email'
                          ? 'email'
                          : 'off'
                  }
                  autoCapitalize="none"
                  aria-keyshortcuts="Control+Space Control+C Control+L"
                  disabled={isLoading}
                  spellCheck={false}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </form>
            )}
          </div>
        </section>
      }
    />
  )
}
