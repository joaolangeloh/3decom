import { createClient } from '@/lib/supabase/server'
import { MaterialCard } from '@/components/material-card'
import { MaterialFormDialog } from '@/components/material-form-dialog'
import { Package } from 'lucide-react'

export const metadata = { title: 'Materiais' }

export default async function MateriaisPage() {
  const supabase = await createClient()
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Materiais</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Gerencie seus materiais de impressao
          </p>
        </div>
        <MaterialFormDialog />
      </div>

      {!materials || materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center size-16 rounded-xl bg-accent/10 mb-4">
            <Package className="size-8 text-accent" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Nenhum material</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Adicione seu primeiro material para comecar a calcular custos de impressao.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  )
}
