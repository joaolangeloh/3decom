'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ReloadButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => router.refresh()}
    >
      Já paguei
    </Button>
  )
}
