import { GraphQLClient } from 'graphql-request'

const GRAPHQL_API_PATH = '/api/graphql'

export const gqlClient = new GraphQLClient(`${process.env.NEXT_PUBLIC_API_URL}${GRAPHQL_API_PATH}`)

export function setAuthToken(token: string) {
  gqlClient.setHeader('Authorization', `Bearer ${token}`)

  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

export function clearAuthToken() {
  gqlClient.setHeader('Authorization', '')

  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

export function initializeAuth() {
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('authToken')
  if (token) {
    gqlClient.setHeader('Authorization', `Bearer ${token}`)
  }
}

initializeAuth()
