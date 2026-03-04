'use client'

import { useEffect, useRef } from 'react'
import { fbq } from '@/lib/pixel'

export function PixelCheckoutView() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fbq('track', 'ViewContent', {
      content_name: 'Página de Assinatura',
      currency: 'BRL',
    })
  }, [])

  return null
}

export function PixelPlanClick({
  plan,
  value,
  children,
  href,
  className,
}: {
  plan: string
  value: number
  children: React.ReactNode
  href: string
  className: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        fbq('track', 'InitiateCheckout', {
          content_name: plan,
          currency: 'BRL',
          value,
        })
      }
      className={className}
    >
      {children}
    </a>
  )
}
