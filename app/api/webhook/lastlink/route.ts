import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Lastlink webhook payload (based on official docs)
interface LastlinkWebhook {
  Id: string
  IsTest: boolean
  Event: string
  CreatedAt: string
  Data: {
    Buyer?: { Email: string; Name?: string }
    Member?: { Id: string; Email: string }
    Subscriptions?: { Id: string; ProductId: string }
    Products?: { Id: string; Name: string; Price: number }[]
    Purchase?: { PaymentId: string; Recurrency: boolean }
    Offer?: { Id: string; Name: string; Url: string }
  }
}

const ACTIVATE_EVENTS = new Set([
  'purchase_order_confirmed',
  'recurrent_payment',
  'product_access_started',
])

const DEACTIVATE_EVENTS = new Set([
  'subscription_canceled',
  'subscription_expired',
  'payment_refund',
  'payment_chargeback',
  'product_access_ended',
])

export async function POST(req: Request) {
  const body: LastlinkWebhook = await req.json()

  // Log everything for debugging (remove after confirming format)
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })
  console.log('Lastlink webhook headers:', JSON.stringify(headers))
  console.log('Lastlink webhook body:', JSON.stringify(body))

  // Auth: try token from common header locations and body
  const LASTLINK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN
  if (LASTLINK_TOKEN) {
    const token =
      req.headers.get('x-lastlink-token') ??
      req.headers.get('x-webhook-token') ??
      req.headers.get('authorization')?.replace('Bearer ', '') ??
      (body as unknown as Record<string, unknown>).token as string | undefined ??
      (body as unknown as Record<string, unknown>).Token as string | undefined

    if (token !== LASTLINK_TOKEN) {
      console.log('Lastlink webhook auth failed. Received token:', token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const event = (body.Event ?? '').toLowerCase()
  const email = (
    body.Data?.Buyer?.Email ??
    body.Data?.Member?.Email ??
    ''
  ).toLowerCase()
  const subscriptionId = body.Data?.Subscriptions?.Id ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email not found in payload' }, { status: 400 })
  }

  // Skip test events in production
  if (body.IsTest) {
    console.log('Lastlink test event, skipping DB update')
    return NextResponse.json({ ok: true, note: 'test event' })
  }

  // Find profile by email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({
      ok: true,
      note: 'user not found, will activate when they register',
    })
  }

  // Determine status
  let status: string
  if (ACTIVATE_EVENTS.has(event)) {
    status = 'active'
  } else if (DEACTIVATE_EVENTS.has(event)) {
    status = 'canceled'
  } else {
    // Unknown event — log but don't change status
    console.log(`Lastlink unknown event: ${event}`)
    return NextResponse.json({ ok: true, note: `unhandled event: ${event}` })
  }

  // Determine plan by Offer ID
  const annualOfferId = process.env.LASTLINK_ANNUAL_OFFER_ID
  const offerId = body.Data?.Offer?.Id ?? ''
  // TODO: remove test offer ID once done testing
  const annualOfferIds = [annualOfferId, '9fc54649-6646-4af6-834e-1e201f8c3b47'].filter(Boolean)
  const isAnnual = annualOfferIds.includes(offerId)
  const plan = isAnnual ? 'annual' : 'monthly'
  const periodDays = isAnnual ? 367 : 32 // 367 days for annual, 32 for monthly

  const currentPeriodEnd =
    status === 'active'
      ? new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString()
      : null

  // Upsert: update if exists, or create subscription record
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', profile.id)
    .single()

  if (existing) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        plan,
        lastlink_subscription_id: subscriptionId || undefined,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id)
  } else if (status === 'active') {
    await supabaseAdmin.from('subscriptions').insert({
      user_id: profile.id,
      status,
      plan,
      lastlink_subscription_id: subscriptionId,
      current_period_end: currentPeriodEnd,
    })
  }

  return NextResponse.json({ ok: true, status })
}
