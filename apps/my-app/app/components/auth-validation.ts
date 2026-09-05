export const MIN_USERNAME_LENGTH = 2
export const MAX_USERNAME_LENGTH = 32
export const MAX_USERNAME_INPUT_LENGTH = 64
export const MAX_EMAIL_LENGTH = 254
export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 72

export type SignupField = 'username' | 'email' | 'password'
export type SignupFieldErrors = Partial<Record<SignupField, string>>

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

export function validateSignupInput(input: { email: string; password: string; username: string }): SignupFieldErrors {
  const fieldErrors: SignupFieldErrors = {}
  const rawUsername = input.username.trim()
  const rawEmail = input.email.trim().toLowerCase()
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

  if (!input.password.trim()) {
    fieldErrors.password = 'password is required'
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `password needs at least ${MIN_PASSWORD_LENGTH} characters`
  } else if (input.password.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.password = `keep your password under ${MAX_PASSWORD_LENGTH} characters`
  }

  return fieldErrors
}

export function validateSignupField(field: SignupField, value: string) {
  return validateSignupInput({
    email: field === 'email' ? value : 'valid@example.com',
    password: field === 'password' ? value : 'valid-password',
    username: field === 'username' ? value : 'valid-user',
  })[field]
}
