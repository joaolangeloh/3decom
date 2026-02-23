import { createClient } from '@/lib/supabase/server'
import { CalculatorForm } from '@/components/calculator/calculator-form'
import { type CalculationInput } from '@/lib/calculator'

export const metadata = { title: 'Calculadora' }

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  let initialData: { id: string; input: CalculationInput; name: string } | null = null

  if (id) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('calculations')
      .select('id, input_data, name')
      .eq('id', id)
      .single()

    if (data?.input_data) {
      initialData = {
        id: data.id,
        input: data.input_data as unknown as CalculationInput,
        name: data.name,
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Precificadora</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Taxas reais 2026 · Shopee & Mercado Livre
        </p>
      </div>
      <CalculatorForm initialData={initialData} />
    </div>
  )
}
