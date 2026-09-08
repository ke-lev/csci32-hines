'use client'

import { useCallback, useRef, useState } from 'react'
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

export type ProfileState = 'loading' | 'ready' | 'empty' | 'error'

export type ProfileView = PublicProfile & { state: ProfileState }

/** Fetched on demand rather than inlined per message, which would repeat the copy on every row. */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileView | null>(null)
  // clicking a second handle while the first is in flight must not be undone by the slower reply
  const latestRequest = useRef(0)

  const open = useCallback(async (username: string) => {
    const requestId = latestRequest.current + 1
    latestRequest.current = requestId

    // the panel opens on the click, not on the response
    setProfile({ username, introTitle: null, introSubhead: null, introBody: null, state: 'loading' })

    try {
      const result = await gqlClient.request(PUBLIC_PROFILE_QUERY, { username })

      if (latestRequest.current !== requestId) return

      const found = result.publicProfile as PublicProfile | null

      setProfile({
        username: found?.username ?? username,
        introTitle: found?.introTitle ?? null,
        introSubhead: found?.introSubhead ?? null,
        introBody: found?.introBody ?? null,
        // an account with nothing written yet is not the same as a request that never landed
        state: found?.introSubhead || found?.introBody ? 'ready' : 'empty',
      })
    } catch {
      if (latestRequest.current !== requestId) return

      setProfile({ username, introTitle: null, introSubhead: null, introBody: null, state: 'error' })
    }
  }, [])

  const close = useCallback(() => {
    // a reply still in flight belongs to a panel that is no longer open
    latestRequest.current += 1
    setProfile(null)
  }, [])

  return { close, open, profile }
}
