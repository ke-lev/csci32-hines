'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useEffect, useState, type MouseEvent } from 'react'
import { PageShell } from '../components/page-shell'
import type { TimelinePost } from './posts'

type TimelineArchiveProps = {
  posts: TimelinePost[]
  selectedPost: TimelinePost
}

export function TimelineArchive({ posts, selectedPost }: TimelineArchiveProps) {
  const [activePost, setActivePost] = useState(selectedPost)

  useEffect(() => {
    function handleHistoryChange() {
      const slug = window.location.pathname.split('/').filter(Boolean).at(-1)
      const post = posts.find((candidate) => candidate.slug === slug)

      if (post) {
        setActivePost(post)
      } else if (window.location.pathname.replace(/\/$/, '') === '/timeline') {
        setActivePost(posts.at(-1) ?? selectedPost)
      }
    }

    window.addEventListener('popstate', handleHistoryChange)
    return () => window.removeEventListener('popstate', handleHistoryChange)
  }, [posts, selectedPost])

  function selectPost(event: MouseEvent<HTMLAnchorElement>, post: TimelinePost) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    event.preventDefault()

    if (post.slug === activePost.slug) {
      return
    }

    setActivePost(post)
    window.history.pushState(null, '', `/timeline/${post.slug}/`)
  }

  return (
    <PageShell
      activeNav="timeline"
      breadcrumbs={[
        { label: 'Users', href: '/' },
        { label: 'kelev', href: '/' },
        { label: 'timeline', href: '/timeline/' },
      ]}
      titleId="timeline-title"
      left={
        <div className="w-full self-center">
          <h1
            className="m-0 max-w-[900px] text-[clamp(4.1rem,8.7vw,9rem)] leading-[0.84] font-[520] tracking-[-0.078em] max-[900px]:text-[clamp(4rem,14vw,7rem)] max-[560px]:text-[clamp(3.65rem,18vw,5.5rem)] max-[560px]:leading-[0.88]"
            id="timeline-title"
          >
            so what had
            <br />
            happened was . . .
          </h1>

          <nav
            className="timeline-scroll mt-[clamp(52px,7vh,78px)] overflow-x-auto pt-8 max-[560px]:-mx-5 max-[560px]:px-5 max-[560px]:pt-12"
            aria-label="Post timeline"
          >
            <ol className="relative mx-6 h-12 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-px before:bg-foreground max-[560px]:min-w-[620px]">
              {posts.map((post) => {
                const selected = post.slug === activePost.slug

                return (
                  <li
                    className="group absolute top-0 flex h-12 w-11 -translate-x-1/2 items-center justify-center"
                    key={post.slug}
                    style={{ left: `${post.timelinePosition}%` }}
                  >
                    <Link
                      className="relative flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                      href={`/timeline/${post.slug}/`}
                      aria-label={`${post.title}, ${post.timelineDateLabel}`}
                      aria-current={selected ? 'page' : undefined}
                      onClick={(event) => selectPost(event, post)}
                    >
                      <span
                        className={`absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.78rem] font-[650] tracking-[-0.02em] transition duration-180 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-within:-translate-y-1 group-focus-within:opacity-100 motion-reduce:transition-none ${
                          selected ? 'text-foreground opacity-100' : 'text-muted opacity-0'
                        }`}
                        aria-hidden="true"
                      >
                        {post.timelineDateLabel}
                      </span>
                      <span
                        className={`relative size-3.5 rounded-full border-2 border-foreground transition duration-180 group-hover:scale-125 group-focus-within:scale-125 motion-reduce:transition-none ${
                          selected ? 'bg-foreground shadow-[0_0_0_4px_#050505]' : 'bg-background'
                        }`}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      }
      right={
        <article
          className="timeline-post h-full overflow-y-auto px-[clamp(14px,2vw,26px)] py-[clamp(18px,2.4vw,34px)]"
          key={activePost.slug}
          aria-live="polite"
        >
          <header className="mb-10 border-b border-line pb-8">
            <time
              className="font-mono text-[0.72rem] font-[650] tracking-[0.06em] text-muted"
              dateTime={activePost.date}
            >
              {activePost.dateLabel}
            </time>
            <h2 className="mt-4 text-[clamp(2.25rem,4vw,3.8rem)] leading-[0.94] font-[540] tracking-[-0.055em]">
              {activePost.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-6 text-subhead">{activePost.description}</p>
          </header>
          <ReactMarkdown>{activePost.content}</ReactMarkdown>
        </article>
      }
    />
  )
}
