export type SiteRoute = {
  command: string
  href: string
  label: string
  path: string
  requiresAuth?: boolean
}

export const SITE_ROUTES = [
  { command: 'home', href: '/', label: 'home', path: '' },
  { command: 'buttons', href: '/buttons/', label: 'buttons', path: 'buttons' },
  { command: 'input', href: '/input/', label: 'input', path: 'input' },
  { command: 'roll', href: '/input/roll/', label: 'roll call', path: 'input/roll' },
  { command: 'games', href: '/games/', label: 'games', path: 'games' },
  { command: 'timeline', href: '/timeline/', label: 'timeline', path: 'timeline' },
  { command: 'users', href: '/users/', label: 'users shell', path: 'users' },
  { command: 'talk', href: '/talk/', label: 'talk', path: 'talk' },
  { command: 'help', href: '/help/', label: 'help docs', path: 'help' },
  { command: 'changelog', href: '/changelog/', label: 'changelog', path: 'changelog' },
  { command: 'welcome', href: '/welcome/', label: 'welcome form', path: 'welcome' },
  { command: 'dashboard', href: '/dashboard/', label: 'dashboard', path: 'dashboard', requiresAuth: true },
] as const satisfies readonly SiteRoute[]

// /admin is documented but stays out of the registry on purpose, so the help lookup has to
// name it separately rather than inferring it from the routes above.
const UNLISTED_DOCUMENTED_PATHS = ['admin']

export function normalizeRoutePath(pathname: string) {
  return pathname
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
}

/**
 * Whether a help doc exists for a pathname, decided without touching the filesystem so the
 * footer info button can gate itself on the client. The help doc coverage test keeps this
 * honest: every registry route is required to have a doc, so registry membership is enough.
 */
export function hasHelpDocForPath(pathname: string) {
  const normalized = normalizeRoutePath(pathname)

  return (
    SITE_ROUTES.some((route) => route.path === normalized) || UNLISTED_DOCUMENTED_PATHS.includes(normalized)
  )
}

export function getVisibleSiteRoutes(isSignedIn = false) {
  return SITE_ROUTES.filter((route) => !('requiresAuth' in route) || !route.requiresAuth || isSignedIn)
}

export function resolveSiteRoute(destination: string, isSignedIn = false) {
  const normalized = normalizeRoutePath(destination)
  const routes = getVisibleSiteRoutes(isSignedIn)
  const route = routes.find((candidate) => candidate.command === normalized || candidate.path === normalized)

  return route ?? (normalized === '' ? routes[0] : undefined)
}

export function getTerminalListing(isSignedIn = false) {
  return `${getVisibleSiteRoutes(isSignedIn)
    .filter((route) => route.command !== 'home')
    .map((route) => `${route.path}/`)
    .join('  ')}  package.json  README.md`
}

export function getTerminalTree(isSignedIn = false) {
  const routeLines = getVisibleSiteRoutes(isSignedIn)
    .filter((route) => route.command !== 'home')
    .map((route) => {
      const segments = route.path.split('/')
      const name = segments[segments.length - 1] ?? route.command
      const indentation = segments.length > 1 ? '│   '.repeat(segments.length - 1) : ''

      return `${indentation}└── ${name}/`
    })

  return ['.', ...routeLines, '├── package.json', '└── README.md'].join('\n')
}
