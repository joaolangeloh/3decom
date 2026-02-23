# 3DEcom v2 — Design Document

## Visão Geral

Precificadora SaaS para impressão 3D. Nova versão reconstruída do zero com arquitetura moderna, substituindo HTML estático em iframe por componentes React nativos.

**Modelo de negócio:** Assinatura R$29/mês via Lastlink.

## Arquitetura

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Auth:** Supabase Auth nativo (email/senha)
- **Banco:** Supabase PostgreSQL com RLS
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Deploy:** Vercel
- **Pagamento:** Lastlink (webhook)

## Rotas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública | Landing page |
| `/auth/login` | Pública | Login |
| `/auth/cadastro` | Pública | Registro |
| `/assinar` | Auth (sem assinatura) | Página de assinatura |
| `/dashboard` | Protegida | Visão geral |
| `/calculadora` | Protegida | Precificadora principal |
| `/materiais` | Protegida | CRUD de materiais |
| `/maquinas` | Protegida | CRUD de máquinas |
| `/historico` | Protegida | Histórico de cálculos |
| `/api/webhook/lastlink` | API | Webhook de pagamento |

## Fluxo do Usuário

1. Acessa `/` → Landing page
2. Cadastra-se em `/auth/cadastro` (Supabase Auth)
3. Trigger cria profile + subscription (inactive)
4. Redirect para `/assinar` → Link para Lastlink
5. Paga → Lastlink envia webhook → Subscription ativada
6. Login → Middleware libera acesso → Dashboard

## Schema do Banco

### profiles
- `id` uuid PK (FK → auth.users.id)
- `name` text
- `email` text unique
- `created_at` timestamptz
- `updated_at` timestamptz

### subscriptions
- `id` uuid PK
- `user_id` uuid FK → profiles.id, unique
- `status` text ('inactive' | 'active' | 'canceled')
- `lastlink_subscription_id` text nullable
- `current_period_end` timestamptz nullable
- `created_at` timestamptz
- `updated_at` timestamptz

### materials
- `id` uuid PK
- `user_id` uuid FK → profiles.id
- `name` text
- `type` text (PLA, ABS, PETG, etc.)
- `price_per_kg` numeric
- `density` numeric (g/cm³)
- `created_at` timestamptz
- `updated_at` timestamptz

### machines
- `id` uuid PK
- `user_id` uuid FK → profiles.id
- `name` text
- `power_consumption_watts` numeric
- `hourly_cost` numeric
- `created_at` timestamptz
- `updated_at` timestamptz

### calculations
- `id` uuid PK
- `user_id` uuid FK → profiles.id
- `material_id` uuid FK → materials.id nullable
- `machine_id` uuid FK → machines.id nullable
- `name` text
- `weight_grams` numeric
- `print_time_minutes` integer
- `material_cost` numeric
- `energy_cost` numeric
- `labor_cost` numeric
- `markup_percent` numeric
- `final_price` numeric
- `marketplace` text nullable (mercadolivre, shopee)
- `marketplace_fee` numeric nullable
- `input_data` jsonb
- `created_at` timestamptz
- `updated_at` timestamptz

## RLS

Todas as tabelas com RLS habilitado. Policy: `user_id = auth.uid()` para SELECT/INSERT/UPDATE/DELETE.

## Integração Lastlink

### Webhook: POST /api/webhook/lastlink

**Autenticação:** Header `x-lastlink-token`

**Eventos tratados:**
- `Purchase_Order_Confirmed`, `Recurrent_Payment` → status 'active'
- `Subscription_Canceled`, `Subscription_Expired`, `Payment_Chargeback`, `Payment_Refund` → status 'canceled'

**Lógica:** Busca profile pelo email do comprador, atualiza subscription.

## Design Visual

- Dark theme: `#080810` / `#0e0e1a`
- Accent: `#00e5a0`
- Fontes: Inter + DM Mono
- Cards com bordas sutis, border-radius 16-20px
- Sidebar (desktop) / Bottom nav (mobile)

## Dependências Principais

- next 15, react 19, typescript 5
- @supabase/ssr, @supabase/supabase-js
- tailwindcss 4, shadcn/ui
- zod 3, lucide-react
