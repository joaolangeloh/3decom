import { createClient } from '@/lib/supabase/server'
import { CalculatorForm } from '@/components/calculator/calculator-form'

export const metadata = { title: 'Calculadora' }

export default async function CalculadoraPage() {
  const supabase = await createClient()

  const [{ data: materials }, { data: machines }] = await Promise.all([
    supabase.from('materials').select('*').order('name'),
    supabase.from('machines').select('*').order('name'),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Calculadora</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Calcule o preco de venda das suas pecas
        </p>
      </div>
      <CalculatorForm
        materials={materials || []}
        machines={machines || []}
      />
    </div>
  )
}
