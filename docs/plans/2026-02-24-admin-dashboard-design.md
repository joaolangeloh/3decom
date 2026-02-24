# Admin Dashboard Design

## Overview
Dashboard admin na rota `/cmadmin` com senha hardcoded para visualizar usuários, status de conta, assinaturas e estatísticas.

## Architecture

### Files
- `app/cmadmin/page.tsx` — Client component com login + dashboard
- `app/api/admin/users/route.ts` — API route server-side com Supabase Admin

### Flow
1. Usuário acessa `/cmadmin` → tela de login (campo de senha)
2. Senha `170Ap300!` verificada no client
3. Após auth → fetch `/api/admin/users`
4. API usa Supabase Admin (service role) para listar `auth.users` + `profiles` + `subscriptions`
5. Dashboard renderiza stats, filtros e tabela

### Stats Cards
- Total Usuários
- Contas Ativadas / Não Ativadas
- Assinaturas Ativas / Inativas
- Convidados (sem assinatura)

### Busca + Filtros
- Input de busca por nome/email
- Filtro: Todos | Ativados | Não Ativados | Assinantes | Inativos | Convidados

### Tabela
| Coluna | Fonte |
|--------|-------|
| Nome | profiles.name |
| Email | profiles.email |
| Conta Ativada | auth.users.email_confirmed_at != null |
| Status Assinatura | subscriptions.status |
| Data Vencimento | subscriptions.current_period_end |
| Tipo | Mensal (se tem assinatura) / Convidado (se não tem) |
| Criado em | profiles.created_at |

### Lógica de Status
- Tem assinatura → tipo "Mensal"
- Sem assinatura e sem current_period_end → tipo "Convidado"
- email_confirmed_at presente → conta ativada
- email_confirmed_at null → conta não ativada

### UI
- Dark theme (#080810 bg, #0e0e1a surface, #00e5a0 accent)
- Componentes shadcn/ui (Card, Input, Button, Table)
- Responsivo
- Tela de login centralizada

### Security
- Senha hardcoded client-side
- API route sem auth check (painel interno simples)
- Rota fora do grupo (protected)
