'use client'

import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ClientError } from 'graphql-request'
import { graphql } from '../generated/gql'
import type { SignInInput, SignUpInput, SignUpMutation } from '../generated/graphql'
import { clearAuthToken, gqlClient, setAuthToken } from '../services/graphql-client'

type AuthPayload = SignUpMutation['signUp']
type AuthUser = AuthPayload['user']

const subscribeToHydration = () => () => {}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const storedUser = localStorage.getItem('authUser')
  return storedUser ? JSON.parse(storedUser) : null
}

const SIGN_UP_MUTATION = graphql(`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        user_id
        name
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
        name
        email
      }
    }
  }
`)

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false)
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

  const signIn = async (input: SignInInput): Promise<AuthPayload | null> => {
    try {
      setIsLoading(true)
      setError(null)

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
