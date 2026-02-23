import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080810] px-6 text-center">
      <p className="text-[8rem] font-bold leading-none text-[#252538] sm:text-[12rem]">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[#ededf8]">
        Pagina nao encontrada
      </h1>
      <p className="mt-2 text-sm text-[#a0a0c0]">
        A pagina que voce procura nao existe ou foi movida.
      </p>
      <Button
        className="mt-8 bg-[#00e5a0] text-[#080810] hover:bg-[#00e5a0]/90 font-semibold"
        asChild
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
          Voltar ao inicio
        </Link>
      </Button>
    </div>
  )
}
