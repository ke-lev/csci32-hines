import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'

// the App Router streams inline scripts and the theme bootstrap in layout.tsx runs inline, so
// script-src keeps 'unsafe-inline' until there is a nonce path worth the complexity here.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.scdn.co",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
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
