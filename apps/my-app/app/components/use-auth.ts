'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ClientError } from 'graphql-request'
import { graphql } from '../generated/gql'
import type { PermissionName, SignInInput, SignUpInput, SignUpMutation } from '../generated/graphql'
import { clearAuthToken, gqlClient, initializeAuth, setAuthToken } from '../services/graphql-client'
import { clearStoredSession, readStoredSession, writeStoredSession } from '../services/auth-session'

type AuthPayload = SignUpMutation['signUp']
type AuthUser = AuthPayload['user']
type AuthField = 'username' | 'email' | 'password'

export type AuthError = {
  code?: string
  fieldErrors: Partial<Record<AuthField, string>>
  message: string
}

const AUTH_CHANGE_EVENT = 'kelev-auth-change'

const subscribeToHydration = () => () => {}

function getStoredUser(): AuthUser | null {
  const session = readStoredSession()
  if (!session) return null

  if (!isAuthUser(session.user)) {
    clearStoredSession()
    clearAuthToken()
    return null
  }

  return session.user
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.user_id === 'string' &&
    typeof candidate.username === 'string' &&
    (candidate.email === null || typeof candidate.email === 'string') &&
    (candidate.role === null || typeof candidate.role === 'string') &&
    Array.isArray(candidate.permissions)
  )
}

// where a session belongs: admins in the console, signed-in users on their dashboard,
// and anyone signed out back on the homepage
export function landingRoute(user: AuthUser | null) {
  if (!user) return '/'

  return user.role === 'Admin' ? '/admin/' : '/dashboard/'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isAuthFailure(caughtError: unknown) {
  if (!(caughtError instanceof ClientError)) return false

  if (caughtError.response.status === 401) return true

  return caughtError.response.errors?.some((graphQLError) => {
    const code = graphQLError.extensions?.code
    return code === 'UNAUTHENTICATED'
  })
}

function saveSession(payload: AuthPayload) {
  // one write, so a tab listening on `storage` can never catch a half-built session
  writeStoredSession(payload.token, payload.user)
  setAuthToken(payload.token)
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

function clearSession() {
  clearStoredSession()
  clearAuthToken()
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

const SIGN_UP_MUTATION = graphql(`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        user_id
        username
        email
        role
        permissions
      }
    }
  }
`)

const SIGN_IN_MUTATION = graphql(`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      token
      user {
        user_id
        username
        email
        role
        permissions
      }
    }
  }
`)

const CURRENT_USER_QUERY = graphql(`
  query CurrentUser {
    currentUser {
      user_id
      username
      email
      role
      permissions
    }
  }
`)

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [isSessionChecked, setIsSessionChecked] = useState(false)
  // bumped whenever the stored token changes under us, so the effect below revalidates the new
  // session instead of trusting whatever the previous one resolved to
  const [sessionGeneration, setSessionGeneration] = useState(0)
  const validatedTokenRef = useRef<string | null>(null)
  const errorRef = useRef<AuthError | null>(null)
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const router = useRouter()

  const setAuthError = (nextError: AuthError | null) => {
    errorRef.current = nextError
    setError(nextError)
  }

  const extractError = (caughtError: unknown, fallback: string): AuthError => {
    if (caughtError instanceof ClientError) {
      const graphQLError = caughtError.response.errors?.[0]
      const extensions = graphQLError?.extensions
      const rawFieldErrors = isRecord(extensions?.fieldErrors) ? extensions.fieldErrors : {}
      const fieldErrors = Object.fromEntries(
        Object.entries(rawFieldErrors).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
      ) as Partial<Record<AuthField, string>>

      return {
        code: typeof extensions?.code === 'string' ? extensions.code : undefined,
        fieldErrors,
        message: graphQLError?.message || fallback,
      }
    }

    return { fieldErrors: {}, message: fallback }
  }

  const recoverSession = useCallback((caughtError: unknown) => {
    if (!isAuthFailure(caughtError)) return false

    clearSession()
    setUser(null)
    setIsSessionChecked(true)
    errorRef.current = null
    setError(null)
    return true
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    let cancelled = false
    const storedUser = getStoredUser()

    if (!storedUser) {
      validatedTokenRef.current = null
      clearAuthToken()
      window.queueMicrotask(() => {
        if (cancelled) return
        setUser(null)
        setIsSessionChecked(true)
      })

      return () => {
        cancelled = true
      }
    }

    initializeAuth()
    // the response is only meaningful for the token that asked for it. another tab can swap the
    // session mid-flight, and without this check a slow answer for account A would be stored
    // against account B's token, or A's stale 401 would clear B's perfectly good session.
    const requestToken = readStoredSession()?.token ?? null
    validatedTokenRef.current = requestToken
    const isStale = () => cancelled || (readStoredSession()?.token ?? null) !== requestToken

    void gqlClient
      .request(CURRENT_USER_QUERY)
      .then((result) => {
        if (isStale()) return

        setUser(result.currentUser)
        // refresh the cached copy with the server's answer, keeping the token it belongs to
        if (requestToken) writeStoredSession(requestToken, result.currentUser)
      })
      .catch((caughtError: unknown) => {
        if (!isStale()) recoverSession(caughtError)
      })
      .finally(() => {
        if (!isStale()) setIsSessionChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [isHydrated, recoverSession, sessionGeneration])

  useEffect(() => {
    if (!isHydrated) return

    const syncFromStorage = () => {
      const storedUser = getStoredUser()

      if ((readStoredSession()?.token ?? null) !== validatedTokenRef.current) {
        setSessionGeneration((generation) => generation + 1)
      }

      if (!storedUser) {
        clearAuthToken()
        setUser(null)
        setIsSessionChecked(true)
        return
      }

      initializeAuth()
      setUser(storedUser)
      setIsSessionChecked(true)
    }

    window.addEventListener('storage', syncFromStorage)
    window.addEventListener(AUTH_CHANGE_EVENT, syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener(AUTH_CHANGE_EVENT, syncFromStorage)
    }
  }, [isHydrated])

  const clearError = () => {
    setAuthError(null)
  }

  const signUp = async (input: SignUpInput): Promise<AuthPayload | null> => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const result = await gqlClient.request(SIGN_UP_MUTATION, { input })
      if (!result.signUp) return null

      saveSession(result.signUp)
      setUser(result.signUp.user)
      setIsSessionChecked(true)
      router.push(landingRoute(result.signUp.user))

      return result.signUp
    } catch (caughtError) {
      setAuthError(extractError(caughtError, 'sign up failed'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (input: SignInInput): Promise<AuthPayload | null> => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const result = await gqlClient.request(SIGN_IN_MUTATION, { input })
      if (!result.signIn) return null

      saveSession(result.signIn)
      setUser(result.signIn.user)
      setIsSessionChecked(true)
      router.push(landingRoute(result.signIn.user))

      return result.signIn
    } catch (caughtError) {
      setAuthError(extractError(caughtError, 'sign in failed'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    clearSession()
    setUser(null)
    setIsSessionChecked(true)
    setAuthError(null)
  }

  // permissions are baked into the JWT at sign-in, so a role change on the backend
  // only takes effect here once the user signs out and back in
  const permissions: PermissionName[] = user?.permissions ?? []
  const hasPermission = (permission: PermissionName) => permissions.includes(permission)
  const isAdmin = user?.role === 'Admin'

  return {
    clearError,
    error,
    getLastError: () => errorRef.current,
    hasPermission,
    isAdmin,
    isHydrated,
    isLoading,
    isSessionChecked,
    permissions,
    recoverSession,
    signIn,
    signOut,
    signUp,
    user,
  }
}
