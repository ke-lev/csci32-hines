export type StoredSession = {
  token: string
  user: unknown
}

const SESSION_KEY = 'authSession'
const LEGACY_TOKEN_KEY = 'authToken'
const LEGACY_USER_KEY = 'authUser'

/**
 * The token and the user are stored together under a single key so that writing a session
 * is one atomic operation.
 *
 * They used to be two keys written back to back. `storage` events fire in other tabs after
 * each write, so a second tab could observe the gap: token present, user not written yet.
 * Its listener read that as a broken session and deleted both keys, signing you out of the
 * tab that had just signed in. With one key a reader sees either the old session or the
 * complete new one, never a half-built one.
 */
export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid stored session')

    const { token, user } = parsed as { token?: unknown; user?: unknown }
    if (typeof token !== 'string' || !token || !user) throw new Error('invalid stored session')

    return { token, user }
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function writeStoredSession(token: string, user: unknown) {
  if (typeof window === 'undefined') return

  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }))
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(SESSION_KEY)
}

/**
 * Clears the pre-atomic key pair. Those sessions were the ones racing tabs could corrupt,
 * so they are dropped rather than migrated: the account signs in once more and lands on the
 * single-key format.
 */
export function dropLegacySessionKeys() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}
