import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calculator, Package, Printer, ArrowRight } from 'lucide-react'
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
    { data: materials },
    { data: machines },
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
    supabase.from('materials').select('id'),
    supabase.from('machines').select('id'),
    supabase.from('calculations').select('*', { count: 'exact', head: true }),
  ])

  const firstName = profile?.name?.split(' ')[0] || 'usuario'
  const isActive = subscription?.status === 'active'

  const stats = [
    {
      label: 'Total de Calculos',
      value: totalCalculations ?? 0,
      icon: Calculator,
    },
    {
      label: 'Materiais Cadastrados',
      value: materials?.length ?? 0,
      icon: Package,
    },
    {
      label: 'Maquinas Cadastradas',
      value: machines?.length ?? 0,
      icon: Printer,
    },
  ]

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

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-6 flex items-start gap-4"
          >
            <div className="flex items-center justify-center size-11 rounded-lg bg-accent/10 shrink-0">
              <stat.icon className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="font-mono text-sm text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acoes rapidas</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/calculadora">
              <Calculator className="size-4" />
              Nova Precificacao
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/materiais">
              <Package className="size-4" />
              Adicionar Material
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/maquinas">
              <Printer className="size-4" />
              Adicionar Maquina
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent calculations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Calculos recentes</h2>
        {!calculations || calculations.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum calculo ainda. Comece usando a calculadora.
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
