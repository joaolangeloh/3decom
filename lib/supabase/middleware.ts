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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPaths = [
    '/dashboard',
    '/calculadora',
    '/materiais',
    '/maquinas',
    '/historico',
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

  // Logged in user on auth pages -> redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
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
