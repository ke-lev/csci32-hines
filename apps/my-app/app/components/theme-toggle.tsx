'use client'

import { useEffect, useSyncExternalStore } from 'react'

type ThemePreference = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<ThemePreference, 'system'>

const preferences: readonly ThemePreference[] = ['system', 'light', 'dark']
const storageKey = 'kelev-theme'

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'dark' || value === 'light' || value === 'system'
}

function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  return preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference
}

function applyTheme(preference: ThemePreference, prefersDark: boolean) {
  const root = document.documentElement

  root.dataset.theme = resolveTheme(preference, prefersDark)
  root.dataset.themePreference = preference
}

function getPreferenceSnapshot(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference ?? null

  return isThemePreference(preference) ? preference : 'system'
}

function getServerPreferenceSnapshot(): ThemePreference {
  return 'system'
}

function subscribeToPreferenceChange(onStoreChange: () => void) {
  window.addEventListener('kelev-theme-change', onStoreChange)

  return () => window.removeEventListener('kelev-theme-change', onStoreChange)
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'light') {
    return (
      <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  if (preference === 'dark') {
    return (
      <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
        <path
          d="M13.7 10.08A5.7 5.7 0 0 1 5.92 2.3 5.71 5.71 0 1 0 13.7 10.08Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
      <rect height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" width="13" x="1.5" y="2" />
      <path d="M5.5 14h5M8 10.5V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  )
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeToPreferenceChange,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const storedPreference = window.localStorage.getItem(storageKey)
    const initialPreference = isThemePreference(storedPreference) ? storedPreference : 'system'
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if ((window.localStorage.getItem(storageKey) ?? 'system') === 'system') {
        applyTheme('system', event.matches)
      }
    }

    applyTheme(initialPreference, media.matches)
    media.addEventListener('change', handleSystemThemeChange)

    return () => media.removeEventListener('change', handleSystemThemeChange)
  }, [])

  function cycleTheme() {
    const currentIndex = preferences.indexOf(preference)
    const nextPreference = preferences[(currentIndex + 1) % preferences.length] ?? 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    applyTheme(nextPreference, prefersDark)

    if (nextPreference === 'system') {
      window.localStorage.removeItem(storageKey)
    } else {
      window.localStorage.setItem(storageKey, nextPreference)
    }

    window.dispatchEvent(new Event('kelev-theme-change'))
  }

  const nextPreference = preferences[(preferences.indexOf(preference) + 1) % preferences.length] ?? 'system'

  return (
    <button
      aria-label={`Theme: ${preference}. Change to ${nextPreference}.`}
      className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-background p-0 font-mono text-[0.62rem] font-semibold tracking-[0.06em] text-foreground lowercase transition-[background-color,border-color,color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={cycleTheme}
      title={`Theme: ${preference}. Click for ${nextPreference}.`}
      type="button"
    >
      <ThemeIcon preference={preference} />
    </button>
  )
}
