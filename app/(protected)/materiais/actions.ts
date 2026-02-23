'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase.from('materials').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    price_per_kg: parseFloat(formData.get('price_per_kg') as string) || 0,
    density: parseFloat(formData.get('density') as string) || 1.24,
  })

  if (error) return { error: error.message }
  revalidatePath('/materiais')
  return { success: true }
}

export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('materials')
    .update({
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      price_per_kg: parseFloat(formData.get('price_per_kg') as string) || 0,
      density: parseFloat(formData.get('density') as string) || 1.24,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/materiais')
  return { success: true }
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('materials').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/materiais')
  return { success: true }
}
