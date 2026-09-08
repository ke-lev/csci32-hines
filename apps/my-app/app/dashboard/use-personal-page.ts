'use client'

import { useCallback, useEffect, useState } from 'react'
import { ClientError } from 'graphql-request'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import type { IntroFieldErrors } from '../lib/personal-page'

export type IntroCopy = {
  body: string
  subhead: string
  title: string
}

export type SaveIntroResult = { ok: true } | { fieldErrors: IntroFieldErrors; ok: false; reason: string }

const MY_PERSONAL_PAGE_QUERY = graphql(`
  query MyPersonalPage {
    myPersonalPage {
      introTitle
      introSubhead
      introBody
      updatedAt
    }
  }
`)

const SAVE_PERSONAL_INTRO_MUTATION = graphql(`
  mutation SavePersonalIntro($input: SavePersonalIntroInput!) {
    savePersonalIntro(input: $input) {
      introTitle
      introSubhead
      introBody
      updatedAt
    }
  }
`)

type PersonalPageResult = {
  introBody?: string | null
  introSubhead?: string | null
  introTitle?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function toIntroCopy(page: PersonalPageResult | null | undefined): IntroCopy | null {
  if (!page?.introTitle || !page.introSubhead) return null

  return { body: page.introBody || '', subhead: page.introSubhead, title: page.introTitle }
}

function extractFieldErrors(caughtError: unknown): IntroFieldErrors {
  if (!(caughtError instanceof ClientError)) return {}

  const extensions = caughtError.response.errors?.[0]?.extensions
  const rawFieldErrors = isRecord(extensions?.fieldErrors) ? extensions.fieldErrors : {}

  return Object.fromEntries(
    Object.entries(rawFieldErrors).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  ) as IntroFieldErrors
}

/**
 * Only input errors carry a message worth showing. Anything else - a missing table, a dead
 * connection - would put an internal string in the interface, so it reads as the fallback.
 */
function extractReason(caughtError: unknown, fallback: string) {
  if (!(caughtError instanceof ClientError)) return fallback

  const graphQLError = caughtError.response.errors?.[0]

  return graphQLError?.extensions?.code === 'BAD_USER_INPUT' ? graphQLError.message || fallback : fallback
}

/**
 * Loads and saves the one personal page the signed-in account owns. Every operation is keyed on
 * the session behind the request, so there is no page id to pass and no other account to reach.
 */
export function usePersonalPage({
  recoverSession,
  userId,
}: {
  recoverSession: (caughtError: unknown) => boolean
  userId: string | null
}) {
  const [savedIntro, setSavedIntro] = useState<IntroCopy | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // keyed on the account rather than a readiness flag. when another tab swaps the session a
  // boolean stays true, so the previous account's page would stay on screen — and the next save
  // would write it under the new account's token. adjusted during render (rather than in an
  // effect) so no paint ever shows one account's page while another is signed in.
  const [loadedUserId, setLoadedUserId] = useState(userId)

  if (userId !== loadedUserId) {
    setLoadedUserId(userId)
    setSavedIntro(null)
    setIsLoaded(false)
    setLoadError(null)
  }

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    void gqlClient
      .request(MY_PERSONAL_PAGE_QUERY)
      .then((result) => {
        if (cancelled) return

        setSavedIntro(toIntroCopy(result.myPersonalPage))
        setLoadError(null)
        setIsLoaded(true)
      })
      .catch((caughtError: unknown) => {
        if (cancelled || recoverSession(caughtError)) return

        // the page stays usable, but the saved copy stays unknown so saving from here replaces
        // whatever is stored
        setLoadError('could not load your saved page')
        setIsLoaded(false)
      })

    return () => {
      cancelled = true
    }
  }, [recoverSession, userId])

  const saveIntro = useCallback(
    async (intro: IntroCopy): Promise<SaveIntroResult> => {
      try {
        const result = await gqlClient.request(SAVE_PERSONAL_INTRO_MUTATION, {
          input: { introBody: intro.body, introSubhead: intro.subhead, introTitle: intro.title },
        })

        setSavedIntro(toIntroCopy(result.savePersonalIntro))

        return { ok: true }
      } catch (caughtError) {
        if (recoverSession(caughtError)) {
          return { fieldErrors: {}, ok: false, reason: 'your session expired - sign in again' }
        }

        return {
          fieldErrors: extractFieldErrors(caughtError),
          ok: false,
          reason: extractReason(caughtError, 'could not save your intro'),
        }
      }
    },
    [recoverSession],
  )

  // settled means the load finished one way or the other, so the page can stop waiting on it
  return { isLoaded, isSettled: isLoaded || loadError !== null, loadError, saveIntro, savedIntro }
}
