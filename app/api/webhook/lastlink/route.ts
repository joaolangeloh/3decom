import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const token =
    req.headers.get('x-lastlink-token') ?? req.headers.get('authorization')
  const LASTLINK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN!

  if (token !== LASTLINK_TOKEN && token !== `Bearer ${LASTLINK_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log('Lastlink webhook:', JSON.stringify(body))

  const event = (body.event ?? body.type ?? '').toLowerCase()
  const email = (body.customer?.email ?? body.email ?? '').toLowerCase()
  const lastlinkId = body.subscription?.id ?? body.id ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 400 })
  }

  // Find profile by email (uses admin client to bypass RLS)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({
      ok: true,
      note: 'user not found, will retry when they register',
    })
  }

  // Determine status from event
  const activationKeywords = [
    'confirmed',
    'recurrent',
    'paid',
    'active',
    'approved',
    'created',
  ]
  const cancellationKeywords = [
    'canceled',
    'expired',
    'chargeback',
    'refund',
  ]

  let status = 'inactive'
  if (activationKeywords.some((kw) => event.includes(kw))) {
    status = 'active'
  } else if (cancellationKeywords.some((kw) => event.includes(kw))) {
    status = 'canceled'
  }

  const currentPeriodEnd =
    status === 'active'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      lastlink_subscription_id: lastlinkId,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id)

  return NextResponse.json({ ok: true, status })
}
