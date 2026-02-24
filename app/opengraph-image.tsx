import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '3DEcom — Precificadora para Impressão 3D'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#060609',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Accent line top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #00e5a0, #00c87a)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: '#ffffff' }}>3D</span>
          <span style={{ color: '#00e5a0' }}>Ecom</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#b0b0cc',
            marginTop: 16,
            letterSpacing: 1,
          }}
        >
          Precificadora para Impressão 3D
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: '#1e1e30',
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 18,
            color: '#555578',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#00e5a0' }}>&#10003;</span>
            <span>Mercado Livre</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#00e5a0' }}>&#10003;</span>
            <span>Shopee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#00e5a0' }}>&#10003;</span>
            <span>Venda Direta</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 16,
            color: '#2a2a40',
            letterSpacing: 2,
          }}
        >
          precificadora3decom.com.br
        </div>
      </div>
    ),
    { ...size }
  )
}
