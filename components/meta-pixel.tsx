'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { PIXEL_ID, fbq } from '@/lib/pixel'

export function MetaPixel() {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  // Initialize fbq queue before script loads
  useEffect(() => {
    if (!PIXEL_ID) return
    if (typeof window.fbq === 'function') return

    // Create the fbq function queue (same as Meta's snippet)
    const n = (window.fbq = function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((n as any).callMethod) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(n as any).callMethod(...args)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(n as any).queue.push(args)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []

    window.fbq('init', PIXEL_ID)
    window.fbq('track', 'PageView')
  }, [])

  // Track PageView on client-side route changes
  useEffect(() => {
    if (prevPath.current !== pathname) {
      fbq('track', 'PageView')
      prevPath.current = pathname
    }
  }, [pathname])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/fbevents.js"
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
