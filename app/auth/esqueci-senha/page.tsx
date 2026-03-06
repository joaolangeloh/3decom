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
            <div className="flex gap-3">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  Gmail
                </Button>
              </a>
              <a
                href="https://outlook.live.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 0 1-.588.236h-8.174v-8.47l1.6 1.18 .4.27a.4.4 0 0 0 .5-.01l6.5-4.76v.5zM15 11.105V9.207l-.4-.27-1.6-1.14V18.677h11V8.387l-6.2 4.538a2.4 2.4 0 0 1-2.8.18zM9.6 2.4 0 4.8v14.4l9.6 2.4V2.4zM6.2 15.66c-.4.47-.88.7-1.45.7-.55 0-1-.24-1.35-.7-.35-.47-.53-1.1-.53-1.87v-.38c0-.8.17-1.44.52-1.92.35-.48.82-.72 1.4-.72.57 0 1.03.22 1.41.65.37.43.56 1.03.56 1.78v.55c0 .76-.18 1.38-.55 1.86zm-.83-3.46c-.17-.3-.42-.45-.74-.45-.33 0-.58.15-.75.46-.17.31-.26.74-.26 1.3v.5c0 .57.09 1.01.26 1.32.18.31.43.47.76.47s.58-.15.74-.45c.16-.3.24-.73.24-1.3v-.45c0-.6-.08-1.07-.25-1.4zM24 5.387c0-.23-.08-.42-.238-.57a.806.806 0 0 0-.588-.23H15c-.23 0-.424.077-.576.23a.782.782 0 0 0-.236.57v1.82l5 3.66 4.812-3.52V5.387z"/></svg>
                  Outlook
                </Button>
              </a>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground font-mono">
              Não encontrou? Verifique a caixa de spam.
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
            <CardFooter className="flex flex-col space-y-4 mt-2">
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
