'use client'

import { useEffect, useRef } from 'react'
import { fbq } from '@/lib/pixel'

/**
 * Fires a pixel event once on mount.
 * Use inside pages that are server-rendered.
 */
export function PixelEvent({
  event,
  params,
}: {
  event: string
  params?: Record<string, string | number>
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fbq('track', event, params)
  }, [event, params])

  return null
}

/**
 * Tracks time spent on page via custom events.
 * Fires at 30s, 60s, and 120s thresholds.
 */
export function PixelTimeOnPage() {
  useEffect(() => {
    const thresholds = [30, 60, 120]
    const timers = thresholds.map((seconds) =>
      setTimeout(() => {
        fbq('trackCustom', 'TimeOnPage', { seconds })
      }, seconds * 1000)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return null
}

/**
 * Tracks scroll depth milestones (25%, 50%, 75%, 100%).
 */
export function PixelScrollDepth() {
  useEffect(() => {
    const milestones = new Set<number>()

    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const percent = Math.round((scrollTop / docHeight) * 100)
      const checkpoints = [25, 50, 75, 100]

      for (const cp of checkpoints) {
        if (percent >= cp && !milestones.has(cp)) {
          milestones.add(cp)
          fbq('trackCustom', 'ScrollDepth', { percent: cp })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return null
}
