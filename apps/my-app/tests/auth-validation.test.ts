import { describe, expect, it } from 'vitest'
import { validateSignupInput, validateSignupField } from '../app/components/auth-validation'

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
})
