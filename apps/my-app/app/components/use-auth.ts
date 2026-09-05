'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ClientError } from 'graphql-request'
import { graphql } from '../generated/gql'
import type { SignInInput, SignUpInput, SignUpMutation } from '../generated/graphql'
import { clearAuthToken, gqlClient, initializeAuth, setAuthToken } from '../services/graphql-client'

type AuthPayload = SignUpMutation['signUp']
type AuthUser = AuthPayload['user']
type AdminAuth = { admin: true }
type AuthField = 'username' | 'email' | 'password'

export type AuthError = {
  code?: string
  fieldErrors: Partial<Record<AuthField, string>>
  message: string
}

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'password'
const AUTH_CHANGE_EVENT = 'kelev-auth-change'

const subscribeToHydration = () => () => {}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  if (!localStorage.getItem('authToken')) {
    localStorage.removeItem('authUser')
    return null
  }

  const storedUser = localStorage.getItem('authUser')
  if (!storedUser) return null

  try {
    const parsed = JSON.parse(storedUser) as unknown
    if (!isAuthUser(parsed)) throw new Error('invalid stored user')
    return parsed
  } catch {
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    clearAuthToken()
    return null
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.user_id === 'string' &&
    typeof candidate.username === 'string' &&
    (candidate.email === null || typeof candidate.email === 'string')
  )
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
  setAuthToken(payload.token)
  localStorage.setItem('authUser', JSON.stringify(payload.user))
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

function clearSession() {
  clearAuthToken()
  localStorage.removeItem('authUser')
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
    }
  }
`)

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [isSessionChecked, setIsSessionChecked] = useState(false)
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
    const token = localStorage.getItem('authToken')
    const storedUser = getStoredUser()

    if (!token || !storedUser) {
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
    void gqlClient
      .request(CURRENT_USER_QUERY)
      .then((result) => {
        if (cancelled) return

        setUser(result.currentUser)
        localStorage.setItem('authUser', JSON.stringify(result.currentUser))
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) recoverSession(caughtError)
      })
      .finally(() => {
        if (!cancelled) setIsSessionChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [isHydrated, recoverSession])

  useEffect(() => {
    if (!isHydrated) return

    const syncFromStorage = () => {
      const token = localStorage.getItem('authToken')
      const storedUser = getStoredUser()

      if (!token || !storedUser) {
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
      router.push('/dashboard')

      return result.signUp
    } catch (caughtError) {
      setAuthError(extractError(caughtError, 'sign up failed'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (input: SignInInput): Promise<AuthPayload | AdminAuth | null> => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // This remains the local admin-console bit until backend roles exist.
      if (
        input.username.trim().toLowerCase().replace(/\s+/g, '-') === ADMIN_USERNAME &&
        input.password === ADMIN_PASSWORD
      ) {
        clearSession()
        window.sessionStorage.setItem('kelev-admin', 'root')
        setUser(null)
        setIsSessionChecked(true)
        router.push('/admin')
        return { admin: true }
      }

      const result = await gqlClient.request(SIGN_IN_MUTATION, { input })
      if (!result.signIn) return null

      saveSession(result.signIn)
      setUser(result.signIn.user)
      setIsSessionChecked(true)
      router.push('/dashboard')

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
    window.sessionStorage.removeItem('kelev-admin')
    setUser(null)
    setIsSessionChecked(true)
    setAuthError(null)
  }

  return {
    clearError,
    error,
    getLastError: () => errorRef.current,
    isHydrated,
    isLoading,
    isSessionChecked,
    recoverSession,
    signIn,
    signOut,
    signUp,
    user,
  }
}
