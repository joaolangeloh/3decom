import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    // Verificar se email já existe
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    // Criar usuário
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ name, email: email.toLowerCase(), password_hash })
      .select('id')
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
    }

    // Criar subscription inativa
    await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: user.id, status: 'inactive' })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}
