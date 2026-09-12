import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@repo/ui/styles.css'
import './globals.css'

const themeInitializationScript = `
(() => {
  try {
    const stored = localStorage.getItem('kelev-theme');
    const preference = stored === 'light' || stored === 'dark' ? stored : 'system';
    const resolved = preference === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
  } catch {
    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.themePreference = 'system';
  }
})();
`

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const description = 'beep boop'

export const metadata: Metadata = {
  metadataBase: new URL('https://csci32-hines.vercel.app'),
  title: {
    default: 'kelev',
    template: '%s | kelev',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    description,
    siteName: "git'n init",
    title: 'kelev',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    description,
    title: 'kelev',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
