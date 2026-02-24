'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Informe seu email.' }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/redefinir-senha`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
