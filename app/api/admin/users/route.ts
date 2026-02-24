import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  // Fetch all auth users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Fetch all profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, created_at')

  // Fetch all subscriptions
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status, current_period_end, created_at')

  // Merge data
  const users = (profiles || []).map((profile) => {
    const authUser = authData.users.find((u) => u.id === profile.id)
    const subscription = (subscriptions || []).find((s) => s.user_id === profile.id)

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      emailConfirmed: !!authUser?.email_confirmed_at,
      subscriptionStatus: subscription?.status || null,
      currentPeriodEnd: subscription?.current_period_end || null,
      planType: subscription ? 'Mensal' : 'Convidado',
      createdAt: profile.created_at,
    }
  })

  return NextResponse.json({ users })
}
