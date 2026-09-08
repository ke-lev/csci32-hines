import { describe, expect, it } from 'vitest'
import { getTerminalListing, getTerminalTree, resolveSiteRoute } from '../app/lib/site-routes'

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
