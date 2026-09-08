'use client'

import { useCallback, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'

const PUBLIC_PROFILE_QUERY = graphql(`
  query PublicProfile($username: String!) {
    publicProfile(username: $username) {
      username
      introTitle
      introSubhead
      introBody
    }
  }
`)

export type PublicProfile = {
  username: string
  introTitle: string | null
  introSubhead: string | null
  introBody: string | null
}

/** Fetched on demand rather than inlined per message, which would repeat the copy on every row. */
export function useProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const open = useCallback(async (username: string) => {
    setIsLoading(true)

    try {
      const result = await gqlClient.request(PUBLIC_PROFILE_QUERY, { username })

      setProfile(
        (result.publicProfile as PublicProfile | null) ?? {
          username,
          introTitle: null,
          introSubhead: null,
          introBody: null,
        },
      )
    } catch {
      setProfile({ username, introTitle: null, introSubhead: null, introBody: null })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const close = useCallback(() => setProfile(null), [])

  return { close, isLoading, open, profile }
}
