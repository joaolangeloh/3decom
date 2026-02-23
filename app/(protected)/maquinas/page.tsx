import { createClient } from '@/lib/supabase/server'
import { MachineCard } from '@/components/machine-card'
import { MachineFormDialog } from '@/components/machine-form-dialog'
import { Printer } from 'lucide-react'

export const metadata = { title: 'Maquinas' }

export default async function MaquinasPage() {
  const supabase = await createClient()
  const { data: machines } = await supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Maquinas</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Gerencie suas impressoras 3D
          </p>
        </div>
        <MachineFormDialog />
      </div>

      {!machines || machines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center size-16 rounded-xl bg-accent/10 mb-4">
            <Printer className="size-8 text-accent" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Nenhuma maquina</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Adicione sua primeira impressora para comecar a calcular custos de impressao.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  )
}
