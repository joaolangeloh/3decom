'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 text-3xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <CardTitle className="text-xl">Recuperar senha</CardTitle>
          <CardDescription className="font-mono text-sm">
            Enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>

        {state?.success ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center size-12 rounded-full bg-accent/10">
                <Mail className="size-6 text-accent" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold">Email enviado!</p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e clique no link para redefinir
                  sua senha.
                </p>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        ) : (
          <form action={formAction}>
            <CardContent className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Lembrou a senha?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Voltar para o login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
