import { describe, expect, it } from 'vitest'
import { getPublicHelpDocs, parseHelpDoc, toHelpHref } from '../app/help/doc-schema'

const valid = `---
title: input
route: input
summary: turn a name into a one-line portrait
---

## what it does

it draws.

## how to use

1. type a name
`

describe('help doc frontmatter', () => {
  it('parses the fields the help index renders', () => {
    const doc = parseHelpDoc(valid, 'input')

    expect(doc).toMatchObject({
      admin: false,
      href: '/input/',
      route: 'input',
      slug: 'input',
      summary: 'turn a name into a one-line portrait',
      title: 'input',
    })
    expect(doc.content).toContain('## how to use')
  })

  it('rejects a doc missing a field the index depends on', () => {
    expect(() => parseHelpDoc('---\ntitle: x\nroute: x\n---\nbody', 'x')).toThrow(/summary/)
    expect(() => parseHelpDoc('no frontmatter at all', 'x')).toThrow(/frontmatter/)
  })

  it('marks admin docs so they can be kept out of the public index', () => {
    const doc = parseHelpDoc(valid.replace('route: input', 'route: admin\nadmin: true'), 'admin')

    expect(doc.admin).toBe(true)
    expect(getPublicHelpDocs([doc])).toEqual([])
  })

  // the homepage has an empty route path, which is not a usable frontmatter value
  it('maps the home route onto the site root', () => {
    expect(toHelpHref('home')).toBe('/')
    expect(toHelpHref('input/roll')).toBe('/input/roll/')
  })
})
