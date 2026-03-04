'use client'

import { useEffect, useRef } from 'react'
import { fbq } from '@/lib/pixel'
import { createClient } from '@/lib/supabase/client'

/**
 * Fires Purchase event once per user (tracked in pixel_events table).
 * The server checks if the event was already fired before rendering this component.
 * Inserts to DB first, then fires the pixel to avoid race conditions.
 */
export function PixelPurchase({
  plan,
  value,
}: {
  plan: string
  value: number
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const supabase = createClient()
    supabase
      .from('pixel_events')
      .insert({ event: 'Purchase', params: { plan, value } })
      .then(({ error }) => {
        if (error) {
          // UNIQUE constraint = already fired, skip pixel
          if (error.code === '23505') return
          console.error('pixel_events insert failed:', error.message)
          return
        }
        fbq('track', 'Purchase', {
          content_name: plan,
          currency: 'BRL',
          value,
        })
      })
  }, [plan, value])

  return null
}
