'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from './actions'
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

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signup, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 text-3xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription className="font-mono text-sm">
            Preencha os dados para se cadastrar
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
              <Label htmlFor="name" className="font-mono text-sm">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-sm">
                Senha
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
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
