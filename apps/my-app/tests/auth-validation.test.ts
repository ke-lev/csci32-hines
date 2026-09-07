import { describe, expect, it } from 'vitest'
import { MAX_PASSWORD_BYTES, validateSignupInput, validateSignupField } from '../app/components/auth-validation'

describe('signup validation', () => {
  it('accepts the same normalized values the backend accepts', () => {
    expect(
      validateSignupInput({
        email: ' Person@Example.com ',
        password: 'valid-password',
        username: 'Person Name',
      }),
    ).toEqual({})
  })

  it('reports field-specific signup failures', () => {
    expect(
      validateSignupInput({
        email: 'not-an-email',
        password: 'short',
        username: 'x',
      }),
    ).toEqual({
      email: 'enter a valid email address',
      password: 'password needs at least 6 characters',
      username: 'username must be 2–32 letters, numbers, underscores, or hyphens',
    })
  })

  it('exposes the password rule used by both signup clients', () => {
    expect(validateSignupField('password', 'short')).toBe('password needs at least 6 characters')
  })

  // bcrypt truncates at 72 bytes, so a longer password would share a hash with its own prefix.
  // This password is only 37 code units, which the old character-count rule let through.
  it('rejects a password that is short in characters but over 72 bytes', () => {
    const multibyte = '\u00e9'.repeat(36) + 'A'

    expect(multibyte.length).toBeLessThanOrEqual(MAX_PASSWORD_BYTES)
    expect(new TextEncoder().encode(multibyte).length).toBeGreaterThan(MAX_PASSWORD_BYTES)
    expect(validateSignupField('password', multibyte)).toMatch(/72 bytes/)
  })

  it('still accepts a 72-byte ascii password', () => {
    const ascii = 'a'.repeat(MAX_PASSWORD_BYTES)

    expect(new TextEncoder().encode(ascii).length).toBe(MAX_PASSWORD_BYTES)
    expect(validateSignupField('password', ascii)).toBeUndefined()
  })
})
