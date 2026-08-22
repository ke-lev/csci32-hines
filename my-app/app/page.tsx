'use client'

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
        <a className="wordmark" href="#" aria-label="Northstar home">
          -k-<span aria-hidden="true">/</span>
        </a>
        <p className="availability">
          <span className="status-dot" aria-hidden="true" />
          experiencing interruptions?
        </p>
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

        <nav className="link-list" aria-label="Explore Northstar">
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
        <p>git init</p>
        <p>© 1991</p>
      </footer>
    </main>
  )
}
