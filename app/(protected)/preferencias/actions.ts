'use server'

import { createClient } from '@/lib/supabase/server'

export async function changePassword(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Preencha todos os campos.', success: false }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres.', success: false }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.', success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message, success: false }
  }

  return { success: true }
}
