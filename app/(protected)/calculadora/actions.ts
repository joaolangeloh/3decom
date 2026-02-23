'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type Json } from '@/lib/database.types'

export async function saveCalculation(data: {
  name: string
  materialId: string | null
  machineId: string | null
  weightGrams: number
  printTimeMinutes: number
  materialCost: number
  energyCost: number
  laborCost: number
  markupPercent: number
  finalPrice: number
  marketplace: string | null
  marketplaceFee: number | null
  inputData: Record<string, number | string>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase.from('calculations').insert({
    user_id: user.id,
    name: data.name || 'Sem nome',
    material_id: data.materialId,
    machine_id: data.machineId,
    weight_grams: data.weightGrams,
    print_time_minutes: data.printTimeMinutes,
    material_cost: data.materialCost,
    energy_cost: data.energyCost,
    labor_cost: data.laborCost,
    markup_percent: data.markupPercent,
    final_price: data.finalPrice,
    marketplace: data.marketplace,
    marketplace_fee: data.marketplaceFee,
    input_data: data.inputData as unknown as Json,
  })

  if (error) return { error: error.message }
  revalidatePath('/historico')
  revalidatePath('/dashboard')
  return { success: true }
}
