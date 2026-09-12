import { describe, expect, it } from 'vitest'
import { getTerminalListing, getTerminalTree, hasHelpDocForPath, resolveSiteRoute } from '../app/lib/site-routes'

describe('terminal site routes', () => {
  it('resolves the routes exposed by the shell', () => {
    expect(resolveSiteRoute('games')?.href).toBe('/games/')
    expect(resolveSiteRoute('/input/')?.href).toBe('/input/')
    expect(resolveSiteRoute('input/roll')?.href).toBe('/input/roll/')
    expect(resolveSiteRoute('roll')?.href).toBe('/input/roll/')
    expect(resolveSiteRoute('talk')?.href).toBe('/talk/')
    expect(resolveSiteRoute('welcome')?.href).toBe('/welcome/')
  })

  it('derives the listing and tree from the same registry', () => {
    expect(getTerminalListing()).toContain('input/')
    expect(getTerminalListing()).toContain('input/roll/')
    expect(getTerminalListing()).toContain('games/')
    expect(getTerminalListing()).toContain('talk/')
    expect(getTerminalTree()).toContain('timeline/')
    expect(getTerminalTree()).toContain('└── roll/')
    expect(getTerminalTree()).toContain('welcome/')
  })

  it('only exposes the dashboard to a signed-in shell', () => {
    expect(resolveSiteRoute('dashboard')).toBeUndefined()
    expect(getTerminalListing()).not.toContain('dashboard/')
    expect(getTerminalTree()).not.toContain('dashboard/')

    expect(resolveSiteRoute('dashboard', true)?.href).toBe('/dashboard/')
    expect(getTerminalListing(true)).toContain('dashboard/')
    expect(getTerminalTree(true)).toContain('dashboard/')
  })
})

describe('help doc availability by path', () => {
  // usePathname() reports "/buttons" while every href in the app is written "/buttons/",
  // so both spellings have to land on the same answer or the button flickers in and out
  it('accepts a registry route with or without its trailing slash', () => {
    expect(hasHelpDocForPath('/buttons')).toBe(true)
    expect(hasHelpDocForPath('/buttons/')).toBe(true)
    expect(hasHelpDocForPath('/input/roll')).toBe(true)
    expect(hasHelpDocForPath('/input/roll/')).toBe(true)
  })

  it('treats the bare root as the home doc', () => {
    expect(hasHelpDocForPath('/')).toBe(true)
    expect(hasHelpDocForPath('')).toBe(true)
  })

  // /admin is documented but deliberately absent from the registry
  it('accepts the admin console', () => {
    expect(hasHelpDocForPath('/admin/')).toBe(true)
  })

  // these are the pages that must NOT grow an info button, because nothing documents them
  it('rejects paths no doc covers', () => {
    expect(hasHelpDocForPath('/help/buttons/')).toBe(false)
    expect(hasHelpDocForPath('/timeline/9-7/')).toBe(false)
    expect(hasHelpDocForPath('/nope/')).toBe(false)
  })
})
