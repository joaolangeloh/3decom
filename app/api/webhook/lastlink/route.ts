import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const LASTLINK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN!

export async function POST(req: Request) {
  const token = req.headers.get('x-lastlink-token') ?? req.headers.get('authorization')
  if (token !== LASTLINK_TOKEN && token !== `Bearer ${LASTLINK_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log('Lastlink webhook:', JSON.stringify(body))

  const event = body.event ?? body.type ?? ''
  const email = (body.customer?.email ?? body.email ?? '').toLowerCase()
  const lastlinkId = body.subscription?.id ?? body.id ?? ''

  if (!email) return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) return NextResponse.json({ ok: true, note: 'user not found' })

  let status = 'inactive'
  if (event.includes('paid') || event.includes('active') || event.includes('approved') || event.includes('created')) {
    status = 'active'
  } else if (event.includes('cancel') || event.includes('expired') || event.includes('chargeback')) {
    status = 'canceled'
  }

  const currentPeriodEnd = status === 'active'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null

  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      status,
      lastlink_subscription_id: lastlinkId,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  return NextResponse.json({ ok: true })
}
