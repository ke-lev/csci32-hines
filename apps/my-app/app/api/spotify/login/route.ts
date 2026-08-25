import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI

  if (!clientId || !process.env.SPOTIFY_CLIENT_SECRET || !redirectUri) {
    return Response.json(
      { error: 'Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI first.' },
      { status: 503 },
    )
  }

  const state = randomBytes(24).toString('hex')
  const authorizeUrl = new URL('https://accounts.spotify.com/authorize')
  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'user-read-currently-playing user-read-recently-played',
    show_dialog: 'true',
    state,
  }).toString()

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/api/spotify/callback',
    sameSite: 'lax',
    secure: redirectUri.startsWith('https://'),
  })

  return response
}
