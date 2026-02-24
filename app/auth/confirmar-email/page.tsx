import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'

export const metadata = { title: 'Confirme seu email' }

export default function ConfirmarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4 pb-2">
          <div className="mb-2 text-3xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-accent/10">
              <Mail className="size-8 text-accent" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h1 className="text-xl font-bold">Confirme seu email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enviamos um link de confirmação para o seu email.
            Clique no link para ativar sua conta e acessar a plataforma.
          </p>
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground font-mono">
            Não encontrou? Verifique a caixa de spam.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">
              Voltar para o login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
