'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { PageShell } from '../components/page-shell'
import type { TimelinePost } from './posts'

type TimelineArchiveProps = {
  posts: TimelinePost[]
  selectedPost: TimelinePost
}

export function TimelineArchive({ posts, selectedPost }: TimelineArchiveProps) {
  const [activePost, setActivePost] = useState(selectedPost)
  const [canScrollPost, setCanScrollPost] = useState(false)
  const postRef = useRef<HTMLElement>(null)

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

  useEffect(() => {
    const post = postRef.current

    if (!post) {
      return
    }

    function updateScrollHint() {
      if (!post) {
        return
      }

      const hasMoreContent = post.scrollTop + post.clientHeight < post.scrollHeight - 2
      setCanScrollPost(hasMoreContent)
    }

    updateScrollHint()
    const resizeObserver = new ResizeObserver(updateScrollHint)
    resizeObserver.observe(post)

    return () => resizeObserver.disconnect()
  }, [activePost.slug])

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

  function scrollPostDown() {
    const post = postRef.current

    if (!post) {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    post.scrollBy({
      top: post.clientHeight * 0.72,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'timeline', href: '/timeline/' },
      ]}
      titleId="timeline-title"
      left={
        <div className="w-full self-center">
          <div key={activePost.slug} aria-live="polite">
            <h1
              className="page-intro-title m-0 min-h-[1.68em] max-w-[580px] text-[clamp(4.1rem,8.7vw,9rem)] leading-[0.84] font-[520] tracking-[-0.078em] max-[900px]:text-[clamp(4rem,14vw,7rem)] max-[560px]:min-h-[1.76em] max-[560px]:text-[clamp(3.65rem,18vw,5.5rem)] max-[560px]:leading-[0.88]"
              id="timeline-title"
            >
              {activePost.title}
            </h1>
            <p className="page-intro-description mt-8 max-w-[46ch] text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.55] text-subhead text-balance">
              {activePost.description}
            </p>
          </div>

          <nav
            className="timeline-scroll mt-[clamp(52px,7vh,78px)] overflow-x-auto pt-8 max-[560px]:-mx-5 max-[560px]:px-5 max-[560px]:pt-12"
            aria-label="Post timeline"
          >
            <ol className="relative mx-6 h-12 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-px before:bg-foreground">
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
        <div className="relative min-h-0 flex-1">
          <article
            className="timeline-post h-full overflow-y-auto px-[clamp(14px,2vw,26px)] py-[clamp(18px,2.4vw,34px)]"
            key={activePost.slug}
            ref={postRef}
            aria-live="polite"
            aria-label={`${activePost.title} post content`}
            onScroll={() => {
              const post = postRef.current
              if (post) {
                setCanScrollPost(post.scrollTop + post.clientHeight < post.scrollHeight - 2)
              }
            }}
          >
            <ReactMarkdown>{activePost.content}</ReactMarkdown>
          </article>

          <button
            className={`group absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-line bg-background text-foreground transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none ${
              canScrollPost ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
            }`}
            type="button"
            aria-label="Scroll down in this post"
            disabled={!canScrollPost}
            onClick={scrollPostDown}
          >
            <svg
              className="size-4 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 7.5 10 13l6-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      }
    />
  )
}
