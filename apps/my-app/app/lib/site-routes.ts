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
  { command: 'welcome', href: '/welcome/', label: 'welcome form', path: 'welcome' },
  { command: 'dashboard', href: '/dashboard/', label: 'dashboard', path: 'dashboard', requiresAuth: true },
] as const satisfies readonly SiteRoute[]

export function getVisibleSiteRoutes(isSignedIn = false) {
  return SITE_ROUTES.filter((route) => !('requiresAuth' in route) || !route.requiresAuth || isSignedIn)
}

export function resolveSiteRoute(destination: string, isSignedIn = false) {
  const normalized = destination
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
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
