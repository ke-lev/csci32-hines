export const MIN_USERNAME_LENGTH = 2
export const MAX_USERNAME_LENGTH = 32
export const MAX_USERNAME_INPUT_LENGTH = 64
export const MAX_EMAIL_LENGTH = 254
export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 72

export type SignupField = 'username' | 'email' | 'password'

export type SignupFieldErrors = Partial<Record<SignupField, string>>

export type SignupInputLike = {
  email?: unknown
  password?: unknown
  username?: unknown
}

export type ValidatedSignup = {
  email: string
  password: string
  username: string
}

export type SignupValidation = { ok: true; value: ValidatedSignup } | { fieldErrors: SignupFieldErrors; ok: false }

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validUsername = /^[a-z0-9][a-z0-9_-]{1,31}$/

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function validateSignupInput(input: SignupInputLike): SignupValidation {
  const fieldErrors: SignupFieldErrors = {}
  const rawUsername = typeof input.username === 'string' ? input.username.trim() : ''
  const rawEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const username = normalizeUsername(rawUsername)

  if (!rawUsername) {
    fieldErrors.username = 'username is required'
  } else if (rawUsername.length > MAX_USERNAME_INPUT_LENGTH) {
    fieldErrors.username = `keep your name under ${MAX_USERNAME_INPUT_LENGTH} characters`
  } else if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH ||
    !validUsername.test(username)
  ) {
    fieldErrors.username = 'username must be 2–32 letters, numbers, underscores, or hyphens'
  }

  if (!rawEmail) {
    fieldErrors.email = 'email is required'
  } else if (rawEmail.length > MAX_EMAIL_LENGTH) {
    fieldErrors.email = `keep your email under ${MAX_EMAIL_LENGTH} characters`
  } else if (!validEmail.test(rawEmail)) {
    fieldErrors.email = 'enter a valid email address'
  }

  if (!password.trim()) {
    fieldErrors.password = 'password is required'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `password needs at least ${MIN_PASSWORD_LENGTH} characters`
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.password = `keep your password under ${MAX_PASSWORD_LENGTH} characters`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, ok: false }
  }

  return {
    ok: true,
    value: {
      email: rawEmail,
      password,
      username,
    },
  }
}
