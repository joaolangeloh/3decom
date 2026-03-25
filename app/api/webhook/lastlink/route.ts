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

const PAST_DUE_EVENTS = new Set([
  'subscription_renewal_pending',
  'payment_overdue',
  'payment_failed',
])

const DEACTIVATE_EVENTS = new Set([
  'subscription_canceled',
  'subscription_expired',
  'payment_refund',
  'payment_chargeback',
  'product_access_ended',
])

async function findOrCreateUser(email: string, name: string): Promise<string | null> {
  // 1. Check if profile already exists
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profile) return profile.id

  // 2. No profile — send magic link (creates auth user if needed + sends login email)
  //    The DB trigger handle_new_user automatically creates profile + subscription
  //    Email template must point to /auth/confirm?token_hash={{.TokenHash}}&type=signup
  //    so verifyOtp handles auth without PKCE
  const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: {
      data: { name },
    },
  })

  if (otpError) {
    console.log(`Lastlink webhook: magic link error for ${email}: ${otpError.message}`)
    return null
  }

  console.log(`Lastlink webhook: sent magic link for ${email}`)

  // Wait briefly for the trigger to create the profile, then fetch it
  // signInWithOtp creates the user in auth.users, trigger creates the profile
  const { data: newProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (newProfile) return newProfile.id

  // Fallback: get user ID directly from auth if profile trigger was slow
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const authUser = listData?.users?.find(u => u.email?.toLowerCase() === email)

  if (authUser) {
    // Ensure profile exists
    await supabaseAdmin.from('profiles').upsert({
      id: authUser.id,
      email,
      name: name || (authUser.user_metadata?.name as string) || '',
    })
    return authUser.id
  }

  return null
}

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
  const buyerName = body.Data?.Buyer?.Name ?? ''
  const subscriptionId = body.Data?.Subscriptions?.Id ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email not found in payload' }, { status: 400 })
  }

  // Skip test events in production
  if (body.IsTest) {
    console.log('Lastlink test event, skipping DB update')
    return NextResponse.json({ ok: true, note: 'test event' })
  }

  // Determine status
  let status: string
  if (ACTIVATE_EVENTS.has(event)) {
    status = 'active'
  } else if (PAST_DUE_EVENTS.has(event)) {
    status = 'past_due'
  } else if (DEACTIVATE_EVENTS.has(event)) {
    status = 'canceled'
  } else {
    // Unknown event — log but don't change status
    console.log(`Lastlink unknown event: ${event}`)
    return NextResponse.json({ ok: true, note: `unhandled event: ${event}` })
  }

  // Find or create user
  const userId = await findOrCreateUser(email, buyerName)

  if (!userId) {
    console.log(`Lastlink webhook: could not find or create user for ${email}`)
    return NextResponse.json({ error: 'Could not process user' }, { status: 500 })
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
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        plan,
        lastlink_subscription_id: subscriptionId || undefined,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Lastlink webhook: subscription update failed:', updateError)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }
  } else if (status === 'active') {
    const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      status,
      plan,
      lastlink_subscription_id: subscriptionId,
      current_period_end: currentPeriodEnd,
    })

    if (insertError) {
      console.error('Lastlink webhook: subscription insert failed:', insertError)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, status })
}
