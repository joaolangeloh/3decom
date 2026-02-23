'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createMachine(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase.from('machines').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    power_consumption_watts:
      parseFloat(formData.get('power_consumption_watts') as string) || 0,
    hourly_cost: parseFloat(formData.get('hourly_cost') as string) || 0,
  })

  if (error) return { error: error.message }
  revalidatePath('/maquinas')
  return { success: true }
}

export async function updateMachine(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('machines')
    .update({
      name: formData.get('name') as string,
      power_consumption_watts:
        parseFloat(formData.get('power_consumption_watts') as string) || 0,
      hourly_cost: parseFloat(formData.get('hourly_cost') as string) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/maquinas')
  return { success: true }
}

export async function deleteMachine(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('machines').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/maquinas')
  return { success: true }
}
