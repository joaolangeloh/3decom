'use client'

import { useState, useEffect, useRef } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { signup, signupWithMagicLink } from './actions'
import { fbq } from '@/lib/pixel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CadastroPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [magicState, magicAction, magicPending] = useActionState(signupWithMagicLink, null)
  const [passState, passAction, passPending] = useActionState(signup, null)
  const tracked = useRef(false)

  // Track Lead event on page view
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fbq('track', 'Lead', { content_name: 'Cadastro' })
  }, [])

  // Track CompleteRegistration when magic link is sent
  // (password signup redirects server-side, so passState never reaches success on client)
  useEffect(() => {
    if (magicState?.success) {
      fbq('track', 'CompleteRegistration', { content_name: 'Cadastro' })
    }
  }, [magicState])

  useEffect(() => {
    if (magicState?.success) {
      setEmailSent(true)
    }
  }, [magicState])

  if (emailSent) {
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 mt-2">
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
        <CardContent>
          <Tabs defaultValue="magiclink" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="magiclink" className="flex-1">Link mágico</TabsTrigger>
              <TabsTrigger value="password" className="flex-1">Email e senha</TabsTrigger>
            </TabsList>
            <TabsContent value="magiclink">
              <form action={magicAction} className="space-y-4 pt-4">
                {magicState?.error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {magicState.error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="magic-name" className="font-mono text-sm">
                    Nome
                  </Label>
                  <Input
                    id="magic-name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="font-mono text-sm">
                    Email
                  </Label>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={magicPending}>
                  {magicPending ? 'Enviando...' : 'Enviar link de acesso'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="password">
              <form action={passAction} className="space-y-4 pt-4">
                {passState?.error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {passState.error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="pass-name" className="font-mono text-sm">
                    Nome
                  </Label>
                  <Input
                    id="pass-name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass-email" className="font-mono text-sm">
                    Email
                  </Label>
                  <Input
                    id="pass-email"
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
                <Button type="submit" className="w-full" disabled={passPending}>
                  {passPending ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Já tem uma conta?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
