import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={{
          name: profile?.name || '',
          email: profile?.email || user.email || '',
        }}
      />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <MobileNav
          user={{
            name: profile?.name || '',
            email: profile?.email || user.email || '',
          }}
        />
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
