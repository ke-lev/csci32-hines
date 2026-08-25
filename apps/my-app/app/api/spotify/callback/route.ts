import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;',
      })[character] ?? character,
  )
}

function htmlPage(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: dark; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      body { max-width: 760px; margin: 0 auto; padding: 64px 24px; background: #050505; color: #f4f4ef; }
      h1 { margin: 0 0 24px; font: 600 clamp(2.5rem, 8vw, 5rem)/.9 system-ui, sans-serif; letter-spacing: -.05em; }
      p { color: #aaa9a3; line-height: 1.65; }
      code { display: block; overflow-wrap: anywhere; margin: 24px 0; padding: 18px; border: 1px solid #292927; border-radius: 12px; color: #8ec5ff; }
    </style>
  </head>
  <body>${body}</body>
</html>`,
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
        'Content-Type': 'text/html; charset=utf-8',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
      status,
    },
  )
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const returnedState = request.nextUrl.searchParams.get('state')
  const expectedState = request.cookies.get('spotify_oauth_state')?.value
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return htmlPage(
      'spotify setup failed',
      '<h1>spotify setup failed.</h1><p>The authorization state did not match. Start again from <code>/api/spotify/login</code>.</p>',
      400,
    )
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return htmlPage(
      'spotify setup failed',
      '<h1>spotify setup failed.</h1><p>The server is missing its Spotify configuration.</p>',
      503,
    )
  }

  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    cache: 'no-store',
  })

  const token = (await tokenResponse.json()) as {
    error?: string
    refresh_token?: string
  }

  if (!tokenResponse.ok || !token.refresh_token) {
    return htmlPage(
      'spotify setup failed',
      `<h1>spotify setup failed.</h1><p>Spotify could not issue a refresh token (${escapeHtml(token.error ?? String(tokenResponse.status))}).</p>`,
      502,
    )
  }

  const response = htmlPage(
    'spotify is connected',
    `<h1>spotify is connected.</h1><p>Copy this value into <strong>SPOTIFY_REFRESH_TOKEN</strong> in <code>.env.local</code> and in Vercel. Treat it like a password; do not commit or share it.</p><code>${escapeHtml(token.refresh_token)}</code><p>Then restart the development server or redeploy.</p>`,
  )
  response.cookies.delete('spotify_oauth_state')
  return response
}
