# Admin Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create an admin dashboard at `/cmadmin` with hardcoded password auth that shows user stats, search/filters, and a table of all users with account activation, subscription status, and plan type.

**Architecture:** Single client-side page with two states (login/dashboard). API route using Supabase Admin client fetches all auth users + profiles + subscriptions data. No TDD — this is a UI-only feature with no business logic to unit test.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase Admin API, shadcn/ui components (Card, Table, Input, Button, Badge), Tailwind CSS 4.

---

### Task 1: Create branch and API route

**Files:**
- Create: `app/api/admin/users/route.ts`

**Step 1: Create and switch to the `admin` branch**

```bash
git checkout -b admin
```

**Step 2: Create the API route**

Create `app/api/admin/users/route.ts` with this exact code:

```typescript
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
```

**Step 3: Verify the route works**

```bash
npm run build 2>&1 | head -30
```

Expected: No TypeScript errors for `app/api/admin/users/route.ts`.

**Step 4: Commit**

```bash
git add app/api/admin/users/route.ts
git commit -m "feat: add admin users API route"
```

---

### Task 2: Create the admin dashboard page

**Files:**
- Create: `app/cmadmin/page.tsx`

**Step 1: Create the admin page**

Create `app/cmadmin/page.tsx` with the full client component. This is a large file — here's the complete code:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ADMIN_PASSWORD = '170Ap300!'

type User = {
  id: string
  name: string | null
  email: string
  emailConfirmed: boolean
  subscriptionStatus: string | null
  currentPeriodEnd: string | null
  planType: string
  createdAt: string | null
}

type Filter = 'all' | 'activated' | 'not-activated' | 'subscribers' | 'inactive' | 'guests'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  useEffect(() => {
    if (!authenticated) return
    setLoading(true)
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }, [authenticated])

  const filtered = useMemo(() => {
    let result = users

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          (u.name?.toLowerCase() || '').includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    // Filter
    switch (filter) {
      case 'activated':
        result = result.filter((u) => u.emailConfirmed)
        break
      case 'not-activated':
        result = result.filter((u) => !u.emailConfirmed)
        break
      case 'subscribers':
        result = result.filter((u) => u.subscriptionStatus === 'active')
        break
      case 'inactive':
        result = result.filter(
          (u) => u.subscriptionStatus && u.subscriptionStatus !== 'active'
        )
        break
      case 'guests':
        result = result.filter((u) => !u.subscriptionStatus)
        break
    }

    return result
  }, [users, search, filter])

  const stats = useMemo(() => {
    const total = users.length
    const activated = users.filter((u) => u.emailConfirmed).length
    const notActivated = total - activated
    const activeSubscriptions = users.filter((u) => u.subscriptionStatus === 'active').length
    const inactiveSubscriptions = users.filter(
      (u) => u.subscriptionStatus && u.subscriptionStatus !== 'active'
    ).length
    const guests = users.filter((u) => !u.subscriptionStatus).length
    return { total, activated, notActivated, activeSubscriptions, inactiveSubscriptions, guests }
  }, [users])

  function formatDate(date: string | null) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080810]">
        <Card className="w-full max-w-sm border-[#1a1a2e] bg-[#0e0e1a]">
          <CardHeader>
            <CardTitle className="text-center text-lg text-white">
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError(false)
                }}
                className="border-[#1a1a2e] bg-[#080810] text-white"
              />
              {passwordError && (
                <p className="text-sm text-red-400">Senha incorreta</p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#00e5a0] text-black hover:bg-[#00c98a]"
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#080810] p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Ativados</p>
            <p className="text-2xl font-bold text-[#00e5a0]">{stats.activated}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Não Ativados</p>
            <p className="text-2xl font-bold text-red-400">{stats.notActivated}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Assinantes</p>
            <p className="text-2xl font-bold text-[#00e5a0]">{stats.activeSubscriptions}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Inativos</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.inactiveSubscriptions}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Convidados</p>
            <p className="text-2xl font-bold text-gray-400">{stats.guests}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm border-[#1a1a2e] bg-[#0e0e1a] text-white"
        />
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'Todos'],
            ['activated', 'Ativados'],
            ['not-activated', 'Não Ativados'],
            ['subscribers', 'Assinantes'],
            ['inactive', 'Inativos'],
            ['guests', 'Convidados'],
          ] as [Filter, string][]).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? 'bg-[#00e5a0] text-black hover:bg-[#00c98a]'
                  : 'border-[#1a1a2e] text-gray-400 hover:text-white'
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1a1a2e]">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="border-[#1a1a2e]">
                  <TableCell className="text-white">
                    {user.name || '—'}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.emailConfirmed ? 'default' : 'destructive'}
                      className={
                        user.emailConfirmed
                          ? 'bg-[#00e5a0]/20 text-[#00e5a0]'
                          : ''
                      }
                    >
                      {user.emailConfirmed ? 'Ativada' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.subscriptionStatus === 'active' ? (
                      <Badge className="bg-[#00e5a0]/20 text-[#00e5a0]">
                        Ativa
                      </Badge>
                    ) : user.subscriptionStatus ? (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                        {user.subscriptionStatus === 'canceled' ? 'Cancelada' : user.subscriptionStatus}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-[#1a1a2e] text-gray-500">
                        —
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(user.currentPeriodEnd)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.planType === 'Mensal'
                          ? 'border-[#00e5a0]/30 text-[#00e5a0]'
                          : 'border-[#1a1a2e] text-gray-500'
                      }
                    >
                      {user.planType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add app/cmadmin/page.tsx
git commit -m "feat: add admin dashboard page with login, stats, filters, and user table"
```

---

### Task 3: Manual test and final commit

**Step 1: Start dev server and test**

```bash
npm run dev
```

Test in browser:
1. Go to `http://localhost:3000/cmadmin`
2. Verify login screen appears
3. Enter wrong password → error message
4. Enter `170Ap300!` → dashboard loads
5. Check stats cards show correct counts
6. Test search by name/email
7. Test filter buttons
8. Verify table data is correct

**Step 2: Fix any issues found during testing**

**Step 3: Final commit if changes were made**

```bash
git add -A
git commit -m "fix: admin dashboard adjustments from testing"
```
