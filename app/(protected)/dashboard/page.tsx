import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calculator, ArrowRight, History } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: subscription },
    { data: calculations },
    { count: totalCalculations },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('name')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('calculations').select('*', { count: 'exact', head: true }),
  ])

  const firstName = profile?.name?.split(' ')[0] || 'usuario'
  const isActive = subscription?.status === 'active'

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Ola, {firstName}!
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          {isActive
            ? 'Assinatura ativa — acesso completo'
            : 'Conta gratuita — assine para desbloquear tudo'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-4">
          <div className="flex items-center justify-center size-11 rounded-lg bg-accent/10 shrink-0">
            <Calculator className="size-5 text-accent" />
          </div>
          <div>
            <p className="text-3xl font-bold">{totalCalculations ?? 0}</p>
            <p className="font-mono text-sm text-muted-foreground mt-0.5">
              Precificações realizadas
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-4">
          <div className="flex items-center justify-center size-11 rounded-lg bg-accent/10 shrink-0">
            <History className="size-5 text-accent" />
          </div>
          <div>
            <p className="text-3xl font-bold">2026</p>
            <p className="font-mono text-sm text-muted-foreground mt-0.5">
              Taxas atualizadas
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acoes rapidas</h2>
        <Button asChild size="lg">
          <Link href="/calculadora">
            <Calculator className="size-4" />
            Nova Precificação
          </Link>
        </Button>
      </div>

      {/* Recent calculations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Calculos recentes</h2>
        {!calculations || calculations.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum calculo ainda. Comece usando a precificadora.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{calc.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {calc.created_at
                      ? new Date(calc.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '\u2014'}
                    {calc.marketplace && (
                      <span className="ml-2 text-accent">
                        {calc.marketplace === 'mercadolivre'
                          ? 'ML'
                          : calc.marketplace === 'shopee'
                            ? 'Shopee'
                            : calc.marketplace}
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-mono text-accent font-semibold shrink-0 ml-4">
                  {calc.final_price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            ))}
            <div className="px-5 py-3">
              <Link
                href="/historico"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
              >
                Ver todo o historico
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
