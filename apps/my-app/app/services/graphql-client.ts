import { GraphQLClient } from 'graphql-request'
import { dropLegacySessionKeys, readStoredSession } from './auth-session'

const GRAPHQL_API_PATH = '/api/graphql'

export const gqlClient = new GraphQLClient(`${process.env.NEXT_PUBLIC_API_URL}${GRAPHQL_API_PATH}`)

// these only manage the outgoing header; persistence belongs to auth-session so that a
// session is always written and cleared as a single localStorage entry.
export function setAuthToken(token: string) {
  gqlClient.setHeader('Authorization', `Bearer ${token}`)
}

export function clearAuthToken() {
  gqlClient.setHeader('Authorization', '')
}

export function initializeAuth() {
  const session = readStoredSession()

  gqlClient.setHeader('Authorization', session ? `Bearer ${session.token}` : '')
}

dropLegacySessionKeys()
initializeAuth()
