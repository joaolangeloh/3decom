'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Preencha todos os campos.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/login?msg=senha-atualizada')
}
