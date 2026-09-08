import { describe, expect, it } from 'vitest'
import { guestbookSystemLine } from '../app/lib/system-line-copy'

describe('guestbook system lines', () => {
  it('names the signer', () => {
    expect(guestbookSystemLine('kaleb-hines', 'face')).toBe('kaleb-hines signed the guestbook')
  })

  it('mentions the remix for a cat drawing', () => {
    expect(guestbookSystemLine('kaleb-hines', 'cat')).toBe('kaleb-hines signed the guestbook as a cat')
  })
})
