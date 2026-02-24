import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { ReloadButton } from './reload-button'

export const metadata = { title: 'Assinar' }

export default async function AssinarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (subscription?.status === 'active') redirect('/calculadora')

  const baseUrl = process.env.NEXT_PUBLIC_LASTLINK_URL || '#'
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const params = new URLSearchParams()
  params.set('email', user.email ?? '')
  if (profile?.name) params.set('name', profile.name)
  const lastlinkUrl = `${baseUrl}?${params.toString()}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 text-3xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <CardDescription className="font-mono text-sm">
            Precificadora automática para impressão 3D
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing card */}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Plano Mensal
            </p>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-accent">R$ 29</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="mt-4 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Calculadora de precificação
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Gerenciamento de materiais
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Gerenciamento de máquinas
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Histórico de cálculos
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href={lastlinkUrl} target="_blank">
              Assinar agora — R$29/mês
            </Link>
          </Button>
          <ReloadButton />
          <p className="text-center text-xs text-muted-foreground">
            Após o pagamento, sua assinatura será ativada automaticamente
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
