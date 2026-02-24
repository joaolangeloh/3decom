import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PKCE flow: exchange code for session and redirect to clean URL
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    const cleanUrl = request.nextUrl.clone()
    cleanUrl.searchParams.delete('code')
    const response = NextResponse.redirect(cleanUrl)
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie)
    }
    return response
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPaths = [
    '/calculadora',
    '/historico',
    '/preferencias',
  ]
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isSubscriptionRoute = request.nextUrl.pathname === '/assinar'

  // Not logged in trying to access protected routes
  if (!user && (isProtectedRoute || isSubscriptionRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Logged in user on auth pages -> redirect to calculadora
  // Exception: /auth/redefinir-senha (user needs to set new password after recovery)
  if (user && isAuthRoute && request.nextUrl.pathname !== '/auth/redefinir-senha') {
    const url = request.nextUrl.clone()
    url.pathname = '/calculadora'
    return NextResponse.redirect(url)
  }

  // For protected routes, check subscription
  if (user && isProtectedRoute) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.status !== 'active') {
      const url = request.nextUrl.clone()
      url.pathname = '/assinar'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
