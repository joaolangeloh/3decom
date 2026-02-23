import { createClient } from '@/lib/supabase/server'
import { HistoryTable } from '@/components/history-table'
import { History } from 'lucide-react'

export default async function HistoricoPage() {
  const supabase = await createClient()

  const { data: calculations } = await supabase
    .from('calculations')
    .select('*, materials(name), machines(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Historico</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Todos os seus calculos de precificacao
        </p>
      </div>

      {!calculations || calculations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center size-16 rounded-xl bg-accent/10 mb-4">
            <History className="size-8 text-accent" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Nenhum calculo</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Seus calculos salvos aparecerrao aqui. Use a calculadora para criar o primeiro.
          </p>
        </div>
      ) : (
        <HistoryTable calculations={calculations as any} />
      )}
    </div>
  )
}
