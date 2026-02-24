'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updatePassword } from './actions'
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

export default function RedefinirSenhaPage() {
  const [state, formAction, pending] = useActionState(updatePassword, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 text-3xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <CardTitle className="text-xl">Redefinir senha</CardTitle>
          <CardDescription className="font-mono text-sm">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-sm">
                Nova senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-sm">
                Confirmar nova senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Voltar para o login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
