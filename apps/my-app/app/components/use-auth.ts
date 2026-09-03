'use client'

import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ClientError } from 'graphql-request'
import { graphql } from '../generated/gql'
import type { SignInInput, SignUpInput, SignUpMutation } from '../generated/graphql'
import { clearAuthToken, gqlClient, setAuthToken } from '../services/graphql-client'

type AuthPayload = SignUpMutation['signUp']
type AuthUser = AuthPayload['user']
type AdminAuth = { admin: true }

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'password'

const subscribeToHydration = () => () => {}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const storedUser = localStorage.getItem('authUser')
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    return null
  }
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

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const router = useRouter()

  const extractErrorMessage = (caughtError: unknown, fallback: string) => {
    if (caughtError instanceof ClientError) {
      return caughtError.response.errors?.[0]?.message || fallback
    }

    return fallback
  }

  const signUp = async (input: SignUpInput): Promise<AuthPayload | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await gqlClient.request(SIGN_UP_MUTATION, { input })
      if (!result.signUp) return null

      setAuthToken(result.signUp.token)
      setUser(result.signUp.user)
      localStorage.setItem('authUser', JSON.stringify(result.signUp.user))
      router.push('/dashboard')

      return result.signUp
    } catch (caughtError) {
      setError(extractErrorMessage(caughtError, 'Sign up failed'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (input: SignInInput): Promise<AuthPayload | AdminAuth | null> => {
    try {
      setIsLoading(true)
      setError(null)

      // This remains the local admin-console bit until backend roles exist.
      if (
        input.username.trim().toLowerCase().replace(/\s+/g, '-') === ADMIN_USERNAME &&
        input.password === ADMIN_PASSWORD
      ) {
        clearAuthToken()
        localStorage.removeItem('authUser')
        window.sessionStorage.setItem('kelev-admin', 'root')
        setUser(null)
        router.push('/admin')
        return { admin: true }
      }

      const result = await gqlClient.request(SIGN_IN_MUTATION, { input })
      if (!result.signIn) return null

      setAuthToken(result.signIn.token)
      setUser(result.signIn.user)
      localStorage.setItem('authUser', JSON.stringify(result.signIn.user))
      router.push('/dashboard')

      return result.signIn
    } catch (caughtError) {
      setError(extractErrorMessage(caughtError, 'Sign in failed'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    clearAuthToken()
    localStorage.removeItem('authUser')
    window.sessionStorage.removeItem('kelev-admin')
    setUser(null)
    setError(null)
  }

  return {
    clearError: () => setError(null),
    error,
    isHydrated,
    isLoading,
    signIn,
    signOut,
    signUp,
    user,
  }
}
