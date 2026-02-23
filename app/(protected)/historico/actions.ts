'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteCalculation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('calculations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/historico')
  return { success: true }
}
