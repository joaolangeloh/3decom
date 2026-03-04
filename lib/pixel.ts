// Meta Pixel helper – thin wrapper around window.fbq

type FbqCommand = 'track' | 'trackCustom' | 'init'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fbq(command: FbqCommand, event: string, params?: Record<string, any>) {
  if (!PIXEL_ID) return
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq(command, event, params)
    } else {
      window.fbq(command, event)
    }
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
