'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function ReloadButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMsg, setShowMsg] = useState(false)

  function handleClick() {
    setShowMsg(false)
    startTransition(() => {
      router.refresh()
      setTimeout(() => setShowMsg(true), 1500)
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
        className="gap-2 hover:border-[#00e5a0] hover:text-[#00e5a0]"
      >
        <RefreshCw className={`size-3.5 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Verificando...' : 'Já paguei'}
      </Button>
      {showMsg && (
        <p className="font-mono text-[11px] text-[#ff3f5e]">
          Assinatura não encontrada. Pode levar alguns minutos após o pagamento.
        </p>
      )}
    </div>
  )
}
