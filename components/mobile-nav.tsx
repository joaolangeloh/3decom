'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calculator,
  History,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/calculadora', label: 'Precificar', icon: Calculator },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/preferencias', label: 'Prefs', icon: Settings },
]

interface MobileNavProps {
  user: { name: string; email: string }
}

export function MobileNav({ user: _user }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
