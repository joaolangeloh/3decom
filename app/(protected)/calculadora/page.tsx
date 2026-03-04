import { createClient } from '@/lib/supabase/server'
import { CalculatorForm } from '@/components/calculator/calculator-form'
import { type CalculationInput } from '@/lib/calculator'
import { PixelPurchase } from '@/components/pixel-purchase'

export const metadata = { title: 'Calculadora' }

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const supabase = await createClient()
  let initialData: { id: string; input: CalculationInput; name: string } | null = null

  if (id) {
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

  // Check if Purchase pixel was already fired for this user
  const { data: alreadyFired } = await supabase
    .from('pixel_events')
    .select('id')
    .eq('event', 'Purchase')
    .maybeSingle()

  // Fetch subscription plan for Purchase pixel event
  const shouldFirePurchase = !alreadyFired
  let pixelPlan: string | null = null
  let pixelValue = 0

  if (shouldFirePurchase) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .single()

    if (subscription?.plan) {
      pixelPlan = subscription.plan === 'annual' ? 'Plano Anual' : 'Plano Mensal'
      pixelValue = subscription.plan === 'annual' ? 290 : 29
    }
  }

  return (
    <div>
      {pixelPlan && (
        <PixelPurchase plan={pixelPlan} value={pixelValue} />
      )}
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
