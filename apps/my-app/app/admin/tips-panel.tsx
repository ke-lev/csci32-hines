'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { controlClasses, toolbarClasses } from './console-styles'

export const TIP_IDEAS_QUERY = graphql(`
  query AdminTipIdeas {
    findManyTipIdeas {
      body
      closedAt
      createdAt
      receipt
      shippedHref
      status
    }
  }
`)

const SET_TIP_IDEA_CLOSED_MUTATION = graphql(`
  mutation SetTipIdeaClosed($input: SetTipIdeaClosedInput!) {
    setTipIdeaClosed(input: $input) {
      body
      closedAt
      createdAt
      receipt
      shippedHref
      status
    }
  }
`)

type TipIdea = {
  body: string
  closedAt: string | null
  createdAt: string
  receipt: string
  shippedHref: string | null
  status: string
}

type PanelState = 'loading' | 'loaded' | 'error'
type TipFilter = 'open' | 'closed' | 'all'

type TipsPanelProps = {
  onCountChange?: (count: number) => void
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatus(status: string) {
  return status === 'trying_it' ? 'trying it' : status
}

const tipRowClasses = 'min-w-0 border-b border-line px-[clamp(18px,2vw,28px)] py-5 last:border-b-0'

function TipStatus({ status }: { status: string }) {
  const colorClasses =
    status === 'shipped'
      ? 'border-success/25 bg-success-surface text-success'
      : status === 'trying_it'
        ? 'border-accent/25 bg-accent/5 text-accent'
        : 'border-line bg-surface text-subhead'

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[0.64rem] leading-none ${colorClasses}`}
    >
      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  )
}

export function TipsPanel({ onCountChange }: TipsPanelProps) {
  const [ideas, setIdeas] = useState<TipIdea[]>([])
  const [panelState, setPanelState] = useState<PanelState>('loading')
  const [requestId, setRequestId] = useState(0)
  const [filter, setFilter] = useState<TipFilter>('open')
  const [pendingReceipt, setPendingReceipt] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    gqlClient
      .request(TIP_IDEAS_QUERY)
      .then((result) => {
        if (cancelled) return
        setIdeas(result.findManyTipIdeas)
        setPanelState('loaded')
      })
      .catch(() => {
        if (!cancelled) setPanelState('error')
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  useEffect(() => {
    if (panelState === 'loaded') onCountChange?.(ideas.filter((idea) => !idea.closedAt).length)
  }, [ideas, onCountChange, panelState])

  const openCount = ideas.filter((idea) => !idea.closedAt).length
  const closedCount = ideas.length - openCount
  const visibleIdeas = ideas.filter((idea) => {
    if (filter === 'all') return true
    return filter === 'closed' ? Boolean(idea.closedAt) : !idea.closedAt
  })

  async function setClosed(idea: TipIdea, closed: boolean) {
    setPendingReceipt(idea.receipt)
    setActionError(null)

    try {
      const result = await gqlClient.request(SET_TIP_IDEA_CLOSED_MUTATION, {
        input: { closed, receipt: idea.receipt },
      })
      setIdeas((current) =>
        current.map((currentIdea) =>
          currentIdea.receipt === idea.receipt ? result.setTipIdeaClosed : currentIdea,
        ),
      )
    } catch {
      setActionError(`could not mark ${idea.receipt} ${closed ? 'closed' : 'open'}. try again.`)
    } finally {
      setPendingReceipt(null)
    }
  }

  if (panelState === 'loading') {
    return (
      <div role="status" aria-label="loading submitted tips">
        <p className={`${toolbarClasses} m-0 text-xs text-muted`}>loading submitted tips…</p>
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          {[0, 1, 2].map((row) => (
            <div className={tipRowClasses} key={row}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="h-2 w-32 rounded-full bg-line" />
                <div className="h-5 w-14 rounded-full bg-line" />
              </div>
              <div className="h-3 w-full rounded-full bg-line" />
              <div className="mt-3 h-3 w-4/5 rounded-full bg-line" />
              <div className="mt-5 h-2 w-40 rounded-full bg-line" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (panelState === 'error') {
    return (
      <div className="px-[clamp(18px,2vw,28px)] py-8">
        <p className="m-0 text-sm font-medium text-danger" role="alert">
          could not load submitted tips
        </p>
        <p className="mt-2 mb-5 text-xs leading-5 text-muted">try again to reconnect to the inbox.</p>
        <button
          className={`${controlClasses} min-h-9`}
          onClick={() => {
            setPanelState('loading')
            setRequestId((current) => current + 1)
          }}
          type="button"
        >
          try again
        </button>
      </div>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="px-[clamp(18px,2vw,28px)] py-10" role="status">
        <svg
          className="mb-5 size-7 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16v12H9l-5 4V4Z" />
          <path d="M8 8h8M8 12h5" />
        </svg>
        <h3 className="m-0 text-base font-medium tracking-[-0.02em]">no tips submitted yet</h3>
        <p className="mt-2 max-w-[34ch] text-sm leading-6 text-muted">
          ideas sent through the site’s tips menu will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={`${toolbarClasses} justify-between gap-y-3`}>
        <p className="m-0 text-xs font-medium text-foreground" aria-live="polite">
          {openCount} open <span className="text-muted">· {closedCount} closed</span>
        </p>
        <div aria-label="filter tips" className="flex items-center gap-1" role="group">
          {(['open', 'closed', 'all'] as const).map((option) => (
            <button
              aria-pressed={filter === option}
              className={`${controlClasses} w-[5.5rem] aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground`}
              key={option}
              onClick={() => setFilter(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {actionError ? (
        <p className="m-0 border-b border-line px-[clamp(18px,2vw,28px)] py-3 text-xs leading-5 text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      {visibleIdeas.length === 0 ? (
        <div className="px-[clamp(18px,2vw,28px)] py-10" role="status">
          <h3 className="m-0 text-base font-medium tracking-[-0.02em]">no {filter} tips</h3>
          <p className="mt-2 max-w-[34ch] text-sm leading-6 text-muted">
            {filter === 'open'
              ? 'everything in the inbox is closed.'
              : filter === 'closed'
                ? 'closed tips will collect here.'
                : 'there are no submitted tips yet.'}
          </p>
        </div>
      ) : null}

      {visibleIdeas.map((idea) => (
        <article className={tipRowClasses} key={idea.receipt}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <time className="font-mono text-[0.68rem] tabular-nums text-muted" dateTime={idea.createdAt}>
              {formatStamp(idea.createdAt)}
            </time>
            <TipStatus status={idea.status} />
          </div>

          <div className="text-sm leading-6 text-foreground [overflow-wrap:anywhere] [&>*]:my-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:underline [&_a]:decoration-muted [&_a]:underline-offset-4 [&_a:hover]:text-subhead [&_a:focus-visible]:rounded-xs [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-accent [&_blockquote]:border-l [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:text-subhead [&_code]:rounded-xs [&_code]:bg-surface [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.82em] [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_hr]:border-line [&_img]:max-w-full [&_img]:rounded-lg [&_li+li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-surface [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown
              components={{
                a: ({ children, href }) => (
                  <a href={href} rel="noreferrer" target="_blank">
                    {children}
                  </a>
                ),
              }}
            >
              {idea.body}
            </ReactMarkdown>
          </div>

          <footer className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
            <span className="min-w-0 font-mono text-[0.64rem] leading-5 text-muted [overflow-wrap:anywhere]">
              <span className="select-none">receipt </span>
              <span className="select-all">{idea.receipt}</span>
            </span>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
              {idea.shippedHref ? (
                <a
                  className="inline-flex min-h-8 min-w-0 items-center gap-1.5 text-xs text-success underline decoration-success/40 underline-offset-4 transition-colors hover:decoration-success focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
                  href={idea.shippedHref}
                >
                  <span className="[overflow-wrap:anywhere]">shipped at {idea.shippedHref}</span>
                  <svg
                    className="size-3 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 12 12 4M4 4h8v8" />
                  </svg>
                </a>
              ) : null}
              <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 font-mono text-[0.64rem] text-subhead select-none has-disabled:cursor-wait has-disabled:text-muted">
                <input
                  checked={Boolean(idea.closedAt)}
                  className="size-4 cursor-pointer accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait"
                  disabled={pendingReceipt === idea.receipt}
                  onChange={(event) => void setClosed(idea, event.currentTarget.checked)}
                  type="checkbox"
                />
                {pendingReceipt === idea.receipt ? 'saving…' : 'closed'}
              </label>
            </div>
          </footer>
        </article>
      ))}
    </>
  )
}
