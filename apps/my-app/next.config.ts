import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'
const __impeccableLiveDev = isDevelopment ? ' http://localhost:8400' : ''
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : undefined
const posthogCspSource = (() => {
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!posthogHost) return ''

  try {
    const domain = new URL(posthogHost).hostname.split('.').slice(-2).join('.')
    return ` https://*.${domain}`
  } catch {
    return ''
  }
})()
const connectSources = ["'self'", apiOrigin, isDevelopment ? 'ws:' : undefined].filter(Boolean).join(' ')

// the App Router streams inline scripts and the theme bootstrap in layout.tsx runs inline, so
// script-src keeps 'unsafe-inline' until there is a nonce path worth the complexity here.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}${__impeccableLiveDev}${posthogCspSource}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.scdn.co",
  "font-src 'self' data:",
  `connect-src ${connectSources}${__impeccableLiveDev}${posthogCspSource}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  // @repo/database exports raw TypeScript from src/, so Next has to compile it rather than
  // treat it as a prebuilt dependency the way @repo/ui is.
  transpilePackages: ['@repo/database'],
  // the info modal's server action reads a doc for whatever page the reader is on, so the
  // markdown has to reach every route's bundle. file tracing only finds it on the routes
  // that render a doc themselves, because the directory path is built from process.cwd().
  outputFileTracingIncludes: {
    '/**': ['./app/help/docs/**/*.md'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  webpack: (config, { isServer }) => {
    // NodeNext imports use .js extensions even when the workspace source is TypeScript.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    }
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
  images: {
    remotePatterns: [
      {
        hostname: 'i.scdn.co',
        pathname: '/image/**',
        protocol: 'https',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
