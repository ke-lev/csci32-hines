import { getNowPlaying, isSpotifyConfigured } from '@/app/lib/spotify'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const publicCacheHeaders = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
}

export async function GET() {
  if (!isSpotifyConfigured()) {
    return Response.json(
      { state: 'unavailable' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503,
      },
    )
  }

  try {
    return Response.json(await getNowPlaying(), { headers: publicCacheHeaders })
  } catch {
    return Response.json(
      { state: 'unavailable' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 502,
      },
    )
  }
}
