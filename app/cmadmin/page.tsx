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

type Filter = 'all' | 'activated' | 'not-activated' | 'subscribers' | 'inactive' | 'guests' | 'monthly' | 'annual'

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
        result = result.filter((u) => u.planType === 'Convidado')
        break
      case 'monthly':
        result = result.filter((u) => u.planType === 'Mensal')
        break
      case 'annual':
        result = result.filter((u) => u.planType === 'Anual')
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
    const guests = users.filter((u) => u.planType === 'Convidado').length
    const monthly = users.filter((u) => u.planType === 'Mensal').length
    const annual = users.filter((u) => u.planType === 'Anual').length
    return { total, activated, notActivated, activeSubscriptions, inactiveSubscriptions, guests, monthly, annual }
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
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
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
            <p className="text-sm text-gray-400">Mensais</p>
            <p className="text-2xl font-bold text-blue-400">{stats.monthly}</p>
          </CardContent>
        </Card>
        <Card className="border-[#1a1a2e] bg-[#0e0e1a]">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400">Anuais</p>
            <p className="text-2xl font-bold text-purple-400">{stats.annual}</p>
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
            ['monthly', 'Mensais'],
            ['annual', 'Anuais'],
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
                        user.planType === 'Anual'
                          ? 'border-purple-500/30 text-purple-400'
                          : user.planType === 'Mensal'
                            ? 'border-blue-500/30 text-blue-400'
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
