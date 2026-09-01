import { ImageResponse } from 'next/og'

export const alt = "kelev — git'n init"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#050505',
        color: '#f4f4ef',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 80px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', fontSize: 26, letterSpacing: '0.16em', color: '#92928b' }}>users / kelev</div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 190, letterSpacing: '-0.07em', lineHeight: 1 }}>kelev</div>
        <div style={{ display: 'flex', fontSize: 34, color: '#aaa9a3', marginTop: 28 }}>
          small experiments, dumb games, and an honest semester devlog
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', height: 10, width: 10, borderRadius: 999, background: '#8ec5ff' }} />
        <div style={{ display: 'flex', fontSize: 24, letterSpacing: '0.1em', color: '#64645f' }}>
          git&apos;n init © 2026
        </div>
      </div>
    </div>,
    size,
  )
}
