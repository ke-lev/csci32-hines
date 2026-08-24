type SpotifyImage = {
  height: number | null
  url: string
  width: number | null
}

type SpotifyTrack = {
  album: {
    images: SpotifyImage[]
  }
  artists: Array<{
    name: string
  }>
  external_urls: {
    spotify: string
  }
  id: string
  name: string
  type: 'track'
}

type SpotifyPlayback = {
  is_playing: boolean
  item: SpotifyTrack | { type: string } | null
}

type SpotifyRecentlyPlayed = {
  items: Array<{
    played_at: string
    track: SpotifyTrack
  }>
}

type DisplayTrack = {
  albumArtUrl: string | null
  artist: string
  name: string
  spotifyUrl: string
}

export type NowPlaying =
  | {
      state: 'idle'
    }
  | {
      state: 'paused' | 'playing' | 'recent'
      track: DisplayTrack
    }

type AccessTokenCache = {
  expiresAt: number
  value: string
}

let accessTokenCache: AccessTokenCache | null = null

function displayTrack(track: SpotifyTrack): DisplayTrack {
  return {
    albumArtUrl: track.album.images.at(-1)?.url ?? track.album.images[0]?.url ?? null,
    artist: track.artists.map((artist) => artist.name).join(', '),
    name: track.name,
    spotifyUrl: track.external_urls.spotify,
  }
}

export function isSpotifyConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN,
  )
}

function spotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Spotify is not configured')
  }

  return { clientId, clientSecret, refreshToken }
}

async function getAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.value
  }

  const { clientId, clientSecret, refreshToken } = spotifyCredentials()
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed with ${response.status}`)
  }

  const token = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!token.access_token) {
    throw new Error('Spotify did not return an access token')
  }

  accessTokenCache = {
    value: token.access_token,
    expiresAt: Date.now() + Math.max((token.expires_in ?? 3600) - 60, 60) * 1000,
  }

  return token.access_token
}

export async function getNowPlaying(): Promise<NowPlaying> {
  const accessToken = await getAccessToken()
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok && response.status !== 204) {
    throw new Error(`Spotify playback request failed with ${response.status}`)
  }

  const playback = response.status === 204 ? null : ((await response.json()) as SpotifyPlayback)

  if (playback?.is_playing && playback.item?.type === 'track') {
    return {
      state: 'playing',
      track: displayTrack(playback.item as SpotifyTrack),
    }
  }

  const recentResponse = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  )

  if (recentResponse.ok) {
    const recent = (await recentResponse.json()) as SpotifyRecentlyPlayed
    const track = recent.items[0]?.track

    if (track) {
      return {
        state: 'recent',
        track: displayTrack(track),
      }
    }
  } else if (recentResponse.status !== 403) {
    throw new Error(`Spotify recently played request failed with ${recentResponse.status}`)
  }

  if (playback?.item?.type === 'track') {
    return {
      state: 'paused',
      track: displayTrack(playback.item as SpotifyTrack),
    }
  }

  return { state: 'idle' }
}
