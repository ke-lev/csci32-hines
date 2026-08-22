'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  {
    number: '01',
    title: 'dummy 1',
    description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    number: '02',
    title: 'dummy 2',
    description: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    number: '03',
    title: 'dummy 3',
    description: 'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
]

export default function Home() {
  const [thursdayAnswer, setThursdayAnswer] = useState<string | null>(null)
  const [hasReset, setHasReset] = useState(false)

  function checkThursday() {
    setThursdayAnswer(new Date().getDay() === 4 ? 'yes, it is' : 'no, it is not')
  }

  function resetThursday() {
    setThursdayAnswer(null)
    setHasReset(true)
  }

  return (
    <main className="homepage">
      <header className="site-header">
        <nav className="wordmark" aria-label="Breadcrumb">
          <Link href="/">Users</Link>
          <span aria-hidden="true">/</span>
          <Link href="/" aria-current="page">
            kelev
          </Link>
          <span aria-hidden="true">/</span>
        </nav>
        <nav className="header-links" aria-label="External links">
          <a
            className="header-pill"
            href="https://github.com/ke-lev"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
          <span className="header-pill header-pill--inactive" aria-disabled="true">
            info
          </span>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            wuddup
            <br />
            my dudes?
          </h1>
          <p className="subhead">next app successfully built - ezpz</p>
          <div className="thursday-actions">
            <button
              className={`thursday-button${thursdayAnswer ? ' thursday-button--checked' : ''}`}
              type="button"
              onClick={checkThursday}
            >
              {thursdayAnswer ?? (hasReset ? 'is it thursday yet?' : 'is it thursday?')}
            </button>
            {thursdayAnswer && (
              <button className="thursday-button ok-button" type="button" onClick={resetThursday}>
                ok
              </button>
            )}
          </div>
        </div>

        <nav className="link-list" aria-label="Explore links">
          {links.map((link) => (
            <a className="link-card" href="#" key={link.number}>
              <span className="card-number">{link.number}</span>
              <span className="card-content">
                <span className="card-title">{link.title}</span>
                <span className="card-description">{link.description}</span>
              </span>
              <span className="card-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </nav>
      </section>

      <footer className="site-footer">
        <p className="availability" title="us too">
          <span className="status-dot" aria-hidden="true" />
          experiencing interruptions?
        </p>
        <p>git innit © 2026</p>
      </footer>
    </main>
  )
}
