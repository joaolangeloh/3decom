'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type Json } from '@/lib/database.types'

export async function saveCalculation(data: {
  id?: string
  name?: string
  salePrice: number
  profit: number
  marginPercent: number
  marketplace: string | null
  marketplaceFee: number | null
  inputData: Record<string, unknown>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const row = {
    name: data.name || `Cálculo ${new Date().toLocaleDateString('pt-BR')}`,
    final_price: data.salePrice,
    markup_percent: data.marginPercent,
    marketplace: data.marketplace,
    marketplace_fee: data.marketplaceFee,
    input_data: data.inputData as unknown as Json,
  }

  if (data.id) {
    // Update existing calculation
    const { error } = await supabase
      .from('calculations')
      .update(row)
      .eq('id', data.id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/historico')
    return { success: true, id: data.id }
  }

  // Insert new calculation
  const { data: inserted, error } = await supabase
    .from('calculations')
    .insert({ ...row, user_id: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/historico')
  return { success: true, id: inserted.id }
}
