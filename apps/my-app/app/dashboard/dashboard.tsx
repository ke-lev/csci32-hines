'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Variant } from '@repo/ui/variant'
import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'
import {
  MAX_INTRO_BODY_LENGTH,
  MAX_INTRO_SUBHEAD_LENGTH,
  MAX_INTRO_TITLE_LENGTH,
  validateIntroInput,
} from '../lib/personal-page'
import { Room } from '../talk/room'
import { usePersonalPage, type IntroCopy } from './use-personal-page'

function getDefaultIntro(username: string): IntroCopy {
  return {
    title: `sup\n${username}`,
    subhead: 'welcome to your own homepage',
    body: 'you can customize it to your liking - try it out',
  }
}

const BLANK_INTRO: IntroCopy = { body: '', subhead: '', title: '' }

const pageInfo = [
  '/dashboard',
  'the title, subhead, and short body on the left are live form controls. edits stay in a local preview until you choose save intro; restore defaults only loads the original copy into that preview.',
  '**when you save:** the backend validates the three fields and upserts one personal-page row keyed to the signed-in account. that stored intro is loaded on later visits and is also what other people see when they open your profile from the room.',
]

// the h1 sets leading-[0.84], so glyphs paint outside the line box and overflow-hidden would
// clip ascenders and descenders. the padding gives them room; the negative margin takes that
// room back out of the layout so the intro sits exactly where it does on every other page.
const editableTitleClassName =
  'block min-h-[calc(2lh+0.36em)] w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-[0.18em] -my-[0.18em] font-[inherit] leading-[inherit] tracking-[inherit] text-[inherit] text-foreground caret-accent placeholder:text-muted placeholder:opacity-0 hover:placeholder:opacity-100 focus-visible:placeholder:opacity-100 outline-none focus:outline-none focus-visible:outline-none [field-sizing:content] cursor-text'

const editableSubheadClassName =
  'm-0 block w-full appearance-none rounded-none border-0 bg-transparent p-0 font-[inherit] leading-[inherit] tracking-[inherit] text-[inherit] text-subhead caret-accent placeholder:text-muted placeholder:opacity-0 hover:placeholder:opacity-100 focus-visible:placeholder:opacity-100 outline-none focus:outline-none focus-visible:outline-none cursor-text'

const editableBodyClassName =
  'block min-h-[1.6em] w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-[inherit] leading-[inherit] text-[inherit] text-muted caret-accent placeholder:text-muted placeholder:opacity-0 hover:placeholder:opacity-100 focus-visible:placeholder:opacity-100 outline-none focus:outline-none focus-visible:outline-none [field-sizing:content] cursor-text'

function introCopyMatches(left: IntroCopy, right: IntroCopy) {
  return left.title === right.title && left.subhead === right.subhead && left.body === right.body
}

export function Dashboard() {
  const { isHydrated, isSessionChecked, recoverSession, user } = useAuth()
  const router = useRouter()
  const [draftIntro, setDraftIntro] = useState<IntroCopy | null>(null)
  const [introMessage, setIntroMessage] = useState<string | null>(null)
  const [introError, setIntroError] = useState<string | null>(null)
  const [isSavingIntro, setIsSavingIntro] = useState(false)

  const userId = user?.user_id ?? null
  const isReady = isHydrated && isSessionChecked && Boolean(user)
  const { isSettled, loadError, saveIntro, savedIntro } = usePersonalPage({
    recoverSession,
    userId,
  })

  // an unsaved draft belongs to the account that typed it, so a session swap clears it rather than
  // letting it be saved onto whoever signs in next
  const [draftUserId, setDraftUserId] = useState(userId)

  if (userId !== draftUserId) {
    setDraftUserId(userId)
    setDraftIntro(null)
    setIntroMessage(null)
    setIntroError(null)
  }

  useEffect(() => {
    if (isHydrated && isSessionChecked && !user) {
      router.replace('/welcome/')
    }
  }, [isHydrated, isSessionChecked, router, user])

  const username = isHydrated ? user?.username || user?.email || 'user' : 'user'
  const defaultIntro = getDefaultIntro(username)
  const committedIntro = savedIntro || defaultIntro
  const canEditIntro = isReady && isSettled && !isSavingIntro

  // until the session is checked and the saved page has arrived there is nothing true to show, so
  // the fields stay empty rather than painting the default copy and swapping it for the account's
  // own words a moment later. the three inputs are fixed-height, so blank holds the same layout.
  // this also gates the intro reveal, so the animation plays on the copy instead of on the blank.
  const isIntroResolved = isReady && isSettled
  const previewIntro = draftIntro || (isIntroResolved ? committedIntro : BLANK_INTRO)
  const hasUnsavedChanges = canEditIntro && draftIntro !== null && !introCopyMatches(draftIntro, committedIntro)
  const canRestoreDefaults = canEditIntro && !introCopyMatches(previewIntro, defaultIntro)

  const updateDraftIntro = (field: keyof IntroCopy, value: string) => {
    setDraftIntro((currentDraft) => ({ ...(currentDraft || committedIntro), [field]: value }))
    setIntroError(null)
    setIntroMessage(null)
  }

  const restoreDefaultIntro = () => {
    setDraftIntro(defaultIntro)
    setIntroError(null)
    setIntroMessage('defaults loaded into the preview')
  }

  const submitIntro = async () => {
    if (!draftIntro || !hasUnsavedChanges) return

    const fieldErrors = validateIntroInput({
      introBody: draftIntro.body,
      introSubhead: draftIntro.subhead,
      introTitle: draftIntro.title,
    })
    const firstFieldError = fieldErrors.introTitle || fieldErrors.introSubhead || fieldErrors.introBody

    if (firstFieldError) {
      setIntroError(firstFieldError)
      return
    }

    setIsSavingIntro(true)
    setIntroError(null)
    setIntroMessage(null)

    const result = await saveIntro(draftIntro)

    setIsSavingIntro(false)

    if (!result.ok) {
      const fieldError =
        result.fieldErrors.introTitle || result.fieldErrors.introSubhead || result.fieldErrors.introBody

      // the draft stays put on failure, so nothing typed is lost to a bad round trip
      setIntroError(fieldError || result.reason)
      return
    }

    setDraftIntro(null)
    setIntroMessage('intro saved')
  }

  // a load failure is a warning, not a lock: the page still edits, it just cannot promise what is stored
  const introStatus = introError || (loadError ? `${loadError} - saving will replace whatever is stored` : null)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        // the account crumb waits on the session too, rather than painting the 'user' fallback and
        // swapping it for the real name. it is appended to a left-aligned row, so nothing already
        // on screen moves when it arrives, and `users /` alone is the nav /users itself renders.
        ...(isReady ? [{ label: username, href: '/dashboard/' }] : []),
      ]}
      info={pageInfo}
      titleId="dashboard-title"
      left={
        <PageIntro
          isRevealed={isIntroResolved}
          body={
            <textarea
              aria-label="short body, optional"
              className={editableBodyClassName}
              disabled={!canEditIntro}
              id="dashboard-intro-body"
              maxLength={MAX_INTRO_BODY_LENGTH}
              name="dashboardIntroBody"
              onChange={(event) => updateDraftIntro('body', event.currentTarget.value)}
              placeholder="add a short note"
              readOnly={!canEditIntro}
              rows={1}
              value={previewIntro.body}
            />
          }
          subhead={
            <input
              aria-describedby={introStatus ? 'dashboard-intro-error' : undefined}
              aria-invalid={Boolean(introStatus)}
              aria-label="page subhead"
              className={editableSubheadClassName}
              disabled={!canEditIntro}
              id="dashboard-intro-subhead"
              maxLength={MAX_INTRO_SUBHEAD_LENGTH}
              name="dashboardIntroSubhead"
              onChange={(event) => updateDraftIntro('subhead', event.currentTarget.value)}
              placeholder="write a short subhead"
              readOnly={!canEditIntro}
              type="text"
              value={previewIntro.subhead}
            />
          }
          title={
            <textarea
              aria-describedby={introStatus ? 'dashboard-intro-error' : undefined}
              aria-invalid={Boolean(introStatus)}
              aria-label="page title"
              className={editableTitleClassName}
              disabled={!canEditIntro}
              id="dashboard-intro-title"
              maxLength={MAX_INTRO_TITLE_LENGTH}
              name="dashboardIntroTitle"
              onChange={(event) => updateDraftIntro('title', event.currentTarget.value)}
              placeholder="give it a name"
              readOnly={!canEditIntro}
              rows={2}
              value={previewIntro.title}
            />
          }
          titleId="dashboard-title"
        >
          <div className="mt-6 flex min-h-[2.75rem] flex-wrap items-center gap-x-4 gap-y-3">
            <Button
              className="disabled:cursor-default disabled:opacity-45 disabled:hover:translate-y-0"
              disabled={!hasUnsavedChanges}
              onClick={() => void submitIntro()}
              variant={Variant.PRIMARY}
            >
              {isSavingIntro ? 'saving...' : 'save intro'}
            </Button>
            <Button
              className="disabled:cursor-default disabled:opacity-45 disabled:hover:translate-y-0"
              disabled={!canRestoreDefaults}
              onClick={restoreDefaultIntro}
              variant={Variant.TERTIARY}
            >
              restore defaults
            </Button>
            {introStatus ? (
              <p
                className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase"
                id="dashboard-intro-error"
                role="alert"
              >
                {introStatus}
              </p>
            ) : null}
            {introMessage ? (
              <p className="sr-only" role="status">
                {introMessage}
              </p>
            ) : null}
          </div>
        </PageIntro>
      }
      right={<Room canPost={isReady} />}
      rightInset={false}
    />
  )
}
