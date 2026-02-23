# 3DEcom v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern SaaS pricing calculator for 3D printing with Supabase Auth, RLS, and React-native components replacing the old iframe approach.

**Architecture:** Next.js 15 App Router with Supabase SSR (`@supabase/ssr`) for auth session management via middleware. All user data protected by PostgreSQL RLS policies. Lastlink webhook for subscription activation. Dark theme UI with shadcn/ui components.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Supabase (Auth + DB + RLS), @supabase/ssr, Tailwind CSS 4, shadcn/ui, Zod, Lucide React

**Supabase Project ID:** `goaqytqhvnkyrohuiznx` (sa-east-1)

---

### Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `.env.local`, `.env.example`, `.gitignore`, `CLAUDE.md`

**Step 1: Initialize Next.js 15 project**

Run:
```bash
cd /Users/caio/dev/3decom
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

Expected: Project scaffolded with Next.js 15, Tailwind CSS, TypeScript

**Step 2: Install dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr zod lucide-react
```

**Step 3: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables. This creates `components/ui/`, `lib/utils.ts`, and configures the project.

**Step 4: Configure dark theme colors**

Edit `app/globals.css` to override the shadcn/ui CSS variables with our dark theme:
- Background: `#080810` / `#0e0e1a`
- Accent/Primary: `#00e5a0`
- Font: Inter (already in Next.js) + DM Mono (Google Fonts)

**Step 5: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://goaqytqhvnkyrohuiznx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard>
LASTLINK_WEBHOOK_TOKEN=<existing token>
NEXT_PUBLIC_LASTLINK_URL=<Lastlink checkout URL>
```

**Step 6: Create `.env.example`** (without actual values, for reference)

**Step 7: Create `.gitignore`**

Standard Next.js gitignore + `.env.local`, `.env*.local`

**Step 8: Create `CLAUDE.md`** with project overview and conventions

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: bootstrap Next.js 15 project with Supabase + shadcn/ui"
```

---

### Task 2: Supabase Database Schema

**Context:** Supabase project `goaqytqhvnkyrohuiznx` has old tables (`users`, `subscriptions`). We need to drop them and create the new schema using Supabase migrations.

**Step 1: Drop old tables via Supabase migration**

Apply migration `drop_old_tables`:
```sql
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

**Step 2: Create new schema via Supabase migration**

Apply migration `create_v2_schema`:
```sql
-- Profiles (auto-created via trigger when user signs up)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (1:1 with profile)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'canceled')),
  lastlink_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials (PLA, ABS, PETG, etc.)
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price_per_kg NUMERIC NOT NULL DEFAULT 0,
  density NUMERIC NOT NULL DEFAULT 1.24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines/Printers
CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  power_consumption_watts NUMERIC NOT NULL DEFAULT 0,
  hourly_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculation history
CREATE TABLE public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Sem nome',
  weight_grams NUMERIC NOT NULL DEFAULT 0,
  print_time_minutes INTEGER NOT NULL DEFAULT 0,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  energy_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  markup_percent NUMERIC NOT NULL DEFAULT 0,
  final_price NUMERIC NOT NULL DEFAULT 0,
  marketplace TEXT,
  marketplace_fee NUMERIC,
  input_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_materials_user_id ON public.materials(user_id);
CREATE INDEX idx_machines_user_id ON public.machines(user_id);
CREATE INDEX idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX idx_calculations_created_at ON public.calculations(created_at DESC);
```

**Step 3: Create trigger for auto-creating profile + subscription on signup**

Apply migration `create_auth_trigger`:
```sql
-- Trigger function: creates profile + inactive subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'inactive');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 4: Enable RLS and create policies**

Apply migration `enable_rls_policies`:
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Subscriptions: users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Materials: full CRUD for own data
CREATE POLICY "Users can view own materials"
  ON public.materials FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own materials"
  ON public.materials FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own materials"
  ON public.materials FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own materials"
  ON public.materials FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Machines: full CRUD for own data
CREATE POLICY "Users can view own machines"
  ON public.machines FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own machines"
  ON public.machines FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own machines"
  ON public.machines FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own machines"
  ON public.machines FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Calculations: full CRUD for own data
CREATE POLICY "Users can view own calculations"
  ON public.calculations FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own calculations"
  ON public.calculations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own calculations"
  ON public.calculations FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own calculations"
  ON public.calculations FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

**Step 5: Run security advisors**

Check for any RLS issues via Supabase advisors.

**Step 6: Generate TypeScript types**

Use Supabase to generate TypeScript types and save to `lib/database.types.ts`.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: set up Supabase schema, triggers, and RLS policies"
```

---

### Task 3: Supabase Client Utilities

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/supabase/middleware.ts`

**Step 1: Create browser client** (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client** (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignored, middleware handles refresh
          }
        },
      },
    }
  )
}
```

**Step 3: Create admin client** (`lib/supabase/admin.ts`)

For webhook and server-side admin operations that bypass RLS:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Step 4: Create middleware session updater** (`lib/supabase/middleware.ts`)

```typescript
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes
  const protectedPaths = ['/dashboard', '/calculadora', '/materiais', '/maquinas', '/historico']
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isSubscriptionRoute = request.nextUrl.pathname === '/assinar'

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (!user && isSubscriptionRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and on auth pages, redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // For protected routes, check subscription status
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
```

**Step 5: Create root middleware** (`middleware.ts`)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Supabase client utilities and auth middleware"
```

---

### Task 4: Auth Pages (Login + Registro + Sign Out)

**Files:**
- Create: `app/auth/login/page.tsx`, `app/auth/login/actions.ts`
- Create: `app/auth/cadastro/page.tsx`, `app/auth/cadastro/actions.ts`
- Create: `app/auth/signout/route.ts`
- Create: `app/auth/confirm/route.ts`

**Step 1: Install shadcn/ui components needed**

Run:
```bash
npx shadcn@latest add button input label card
```

**Step 2: Create registration page** (`app/auth/cadastro/page.tsx`)

Client component with form: name, email, password, confirm password.
- Calls server action to sign up via `supabase.auth.signUp()` with name in user_metadata
- On success: redirect to `/assinar`
- On error: show error message

**Step 3: Create registration server action** (`app/auth/cadastro/actions.ts`)

```typescript
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { name: formData.get('name') as string }
    }
  }
  const { error } = await supabase.auth.signUp(data)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  redirect('/assinar')
}
```

**Step 4: Create login page** (`app/auth/login/page.tsx`)

Client component with form: email, password.
- Calls server action to sign in via `supabase.auth.signInWithPassword()`
- On success: redirect to `/dashboard`
- On error: show error message

**Step 5: Create login server action** (`app/auth/login/actions.ts`)

Similar pattern using `signInWithPassword`.

**Step 6: Create sign out route handler** (`app/auth/signout/route.ts`)

POST handler that calls `supabase.auth.signOut()` and redirects to `/`.

**Step 7: Create email confirmation endpoint** (`app/auth/confirm/route.ts`)

GET handler that exchanges `token_hash` for session (for email confirmation flow).

**Step 8: Test auth flow manually**

Run `npm run dev`, test registration + login + sign out.

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: add auth pages (login, register, sign out, email confirm)"
```

---

### Task 5: App Shell (Protected Layout with Sidebar)

**Files:**
- Create: `app/(protected)/layout.tsx`
- Create: `components/sidebar.tsx`
- Create: `components/mobile-nav.tsx`

**Step 1: Install additional shadcn/ui components**

Run:
```bash
npx shadcn@latest add separator avatar dropdown-menu sheet tooltip
```

**Step 2: Create protected layout** (`app/(protected)/layout.tsx`)

Server component that:
- Gets user via `supabase.auth.getUser()`
- Gets profile from `profiles` table
- Renders sidebar (desktop) and mobile nav
- Wraps children in main content area

**Step 3: Create sidebar component** (`components/sidebar.tsx`)

Navigation items:
- Dashboard (LayoutDashboard icon)
- Calculadora (Calculator icon)
- Materiais (Package icon)
- Máquinas (Printer icon)
- Histórico (History icon)
- Separator
- Sign out button

Highlight active route. Show user email at bottom.

**Step 4: Create mobile nav** (`components/mobile-nav.tsx`)

Bottom navigation bar for mobile with the same items as sidebar but as icons with labels below.

**Step 5: Move protected routes into route group**

Move all protected routes under `app/(protected)/`:
- `app/(protected)/dashboard/page.tsx`
- `app/(protected)/calculadora/page.tsx`
- `app/(protected)/materiais/page.tsx`
- `app/(protected)/maquinas/page.tsx`
- `app/(protected)/historico/page.tsx`

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add app shell with sidebar and mobile navigation"
```

---

### Task 6: Subscription Page + Lastlink Webhook

**Files:**
- Create: `app/assinar/page.tsx`
- Create: `app/api/webhook/lastlink/route.ts`

**Step 1: Create subscription page** (`app/assinar/page.tsx`)

Server component that:
- Gets user session
- If not logged in: redirect to `/auth/login`
- If subscription active: redirect to `/dashboard`
- Shows pricing card with R$29/mês and CTA linking to `NEXT_PUBLIC_LASTLINK_URL`
- Shows "Já tenho assinatura" button to retry checking status

**Step 2: Create Lastlink webhook** (`app/api/webhook/lastlink/route.ts`)

```typescript
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const token = req.headers.get('x-lastlink-token') ?? req.headers.get('authorization')
  const LASTLINK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN!

  if (token !== LASTLINK_TOKEN && token !== `Bearer ${LASTLINK_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const event = body.event ?? body.type ?? ''
  const email = (body.customer?.email ?? body.email ?? '').toLowerCase()
  const lastlinkId = body.subscription?.id ?? body.id ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 400 })
  }

  // Find profile by email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({ ok: true, note: 'user not found' })
  }

  // Determine status from event
  const activationEvents = ['Purchase_Order_Confirmed', 'Recurrent_Payment', 'paid', 'active', 'approved', 'created']
  const cancellationEvents = ['Subscription_Canceled', 'Subscription_Expired', 'Payment_Chargeback', 'Payment_Refund', 'cancel', 'expired', 'chargeback']

  let status = 'inactive'
  if (activationEvents.some(e => event.toLowerCase().includes(e.toLowerCase()))) {
    status = 'active'
  } else if (cancellationEvents.some(e => event.toLowerCase().includes(e.toLowerCase()))) {
    status = 'canceled'
  }

  const currentPeriodEnd = status === 'active'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      lastlink_subscription_id: lastlinkId,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id)

  return NextResponse.json({ ok: true })
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add subscription page and Lastlink webhook"
```

---

### Task 7: Materials CRUD

**Files:**
- Create: `app/(protected)/materiais/page.tsx`
- Create: `app/(protected)/materiais/actions.ts`
- Create: `components/material-form.tsx`
- Create: `components/material-card.tsx`

**Step 1: Install shadcn/ui dialog and table**

Run:
```bash
npx shadcn@latest add dialog table select badge alert-dialog
```

**Step 2: Create materials list page** (`app/(protected)/materiais/page.tsx`)

Server component:
- Fetch materials from Supabase (RLS ensures user sees only their own)
- Display as cards grid or table
- "Adicionar Material" button opens dialog
- Each card has edit/delete actions

**Step 3: Create server actions** (`app/(protected)/materiais/actions.ts`)

Server actions for:
- `createMaterial(formData)` — insert into materials
- `updateMaterial(id, formData)` — update material
- `deleteMaterial(id)` — delete material

All use `createClient()` server client (RLS protects data).

**Step 4: Create material form dialog** (`components/material-form.tsx`)

Client component with fields:
- Nome (text)
- Tipo (select: PLA, ABS, PETG, TPU, Resina, Outro)
- Preço por kg (number, R$)
- Densidade (number, g/cm³, default varies by type)

**Step 5: Test CRUD manually**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add materials CRUD page"
```

---

### Task 8: Machines CRUD

**Files:**
- Create: `app/(protected)/maquinas/page.tsx`
- Create: `app/(protected)/maquinas/actions.ts`
- Create: `components/machine-form.tsx`
- Create: `components/machine-card.tsx`

**Step 1: Create machines list page** (`app/(protected)/maquinas/page.tsx`)

Same pattern as materials:
- Server component listing machines
- Add/Edit/Delete via dialogs and server actions

**Step 2: Create server actions** (`app/(protected)/maquinas/actions.ts`)

- `createMachine(formData)`
- `updateMachine(id, formData)`
- `deleteMachine(id)`

**Step 3: Create machine form** (`components/machine-form.tsx`)

Fields:
- Nome (text) — e.g., "Ender 3 V2"
- Consumo (watts) (number)
- Custo por hora (number, R$) — includes energy + depreciation

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add machines CRUD page"
```

---

### Task 9: Calculator (Core Product)

**Files:**
- Create: `app/(protected)/calculadora/page.tsx`
- Create: `components/calculator/calculator-form.tsx`
- Create: `components/calculator/price-breakdown.tsx`
- Create: `components/calculator/marketplace-tabs.tsx`
- Create: `lib/calculator.ts` (calculation logic)
- Create: `app/(protected)/calculadora/actions.ts`

**Step 1: Create calculation logic** (`lib/calculator.ts`)

Pure function with no dependencies:

```typescript
export interface CalculationInput {
  weightGrams: number
  printTimeMinutes: number
  materialPricePerKg: number
  materialDensity: number
  machinePowerWatts: number
  machineHourlyCost: number
  energyCostPerKwh: number
  laborCostPerHour: number
  laborTimeMinutes: number
  markupPercent: number
  marketplace: 'none' | 'mercadolivre' | 'shopee'
}

export interface CalculationResult {
  materialCost: number
  energyCost: number
  machineCost: number
  laborCost: number
  subtotal: number
  markup: number
  marketplaceFee: number
  marketplaceFeePercent: number
  finalPrice: number
}

export function calculate(input: CalculationInput): CalculationResult {
  // Material cost: (weight in grams / 1000) * price per kg
  const materialCost = (input.weightGrams / 1000) * input.materialPricePerKg

  // Energy cost: (power in kW) * (time in hours) * (cost per kWh)
  const printTimeHours = input.printTimeMinutes / 60
  const energyCost = (input.machinePowerWatts / 1000) * printTimeHours * input.energyCostPerKwh

  // Machine cost: hourly cost * time in hours
  const machineCost = input.machineHourlyCost * printTimeHours

  // Labor cost
  const laborCost = input.laborCostPerHour * (input.laborTimeMinutes / 60)

  const subtotal = materialCost + energyCost + machineCost + laborCost
  const markup = subtotal * (input.markupPercent / 100)
  const priceBeforeFees = subtotal + markup

  // Marketplace fees
  let marketplaceFeePercent = 0
  if (input.marketplace === 'mercadolivre') marketplaceFeePercent = 16
  if (input.marketplace === 'shopee') marketplaceFeePercent = 20

  const marketplaceFee = priceBeforeFees * (marketplaceFeePercent / 100)
  const finalPrice = priceBeforeFees + marketplaceFee

  return {
    materialCost,
    energyCost,
    machineCost,
    laborCost,
    subtotal,
    markup,
    marketplaceFee,
    marketplaceFeePercent,
    finalPrice,
  }
}
```

**Step 2: Create calculator page** (`app/(protected)/calculadora/page.tsx`)

Server component that:
- Fetches user's materials and machines from Supabase
- Passes them as props to the client calculator form

**Step 3: Create calculator form** (`components/calculator/calculator-form.tsx`)

Client component (`'use client'`):
- Select material (dropdown from user's materials)
- Select machine (dropdown from user's machines)
- Input: peso (g), tempo de impressão (h + min), custo energia/kWh, mão de obra hora, tempo mão de obra, margem %
- Marketplace tabs: Venda Direta / Mercado Livre / Shopee
- Real-time calculation as user types (debounced)
- "Salvar Cálculo" button

**Step 4: Create price breakdown** (`components/calculator/price-breakdown.tsx`)

Visual breakdown card showing:
- Material: R$ X.XX
- Energia: R$ X.XX
- Máquina: R$ X.XX
- Mão de obra: R$ X.XX
- Subtotal: R$ X.XX
- Margem (XX%): R$ X.XX
- Taxa marketplace (XX%): R$ X.XX
- **Preço Final: R$ X.XX** (highlighted in accent color)

Progress bar showing cost distribution.

**Step 5: Create save calculation action** (`app/(protected)/calculadora/actions.ts`)

Server action to insert into `calculations` table.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add calculator page with real-time pricing"
```

---

### Task 10: Calculation History

**Files:**
- Create: `app/(protected)/historico/page.tsx`
- Create: `app/(protected)/historico/actions.ts`

**Step 1: Create history page** (`app/(protected)/historico/page.tsx`)

Server component:
- Fetch calculations ordered by `created_at DESC`
- Display as table with columns: Nome, Material, Preço Final, Marketplace, Data
- Click row to see full breakdown
- Delete button per row

**Step 2: Create delete action** (`app/(protected)/historico/actions.ts`)

Server action `deleteCalculation(id)`.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add calculation history page"
```

---

### Task 11: Dashboard

**Files:**
- Create: `app/(protected)/dashboard/page.tsx`
- Create: `components/dashboard/stats-cards.tsx`
- Create: `components/dashboard/recent-calculations.tsx`

**Step 1: Create dashboard page** (`app/(protected)/dashboard/page.tsx`)

Server component with:
- Welcome message with user name
- Stats cards: total de cálculos, preço médio, último cálculo
- Recent calculations list (last 5)
- Quick action buttons: "Nova Precificação", "Adicionar Material", "Adicionar Máquina"

**Step 2: Create stats cards** (`components/dashboard/stats-cards.tsx`)

Cards showing key metrics fetched from Supabase.

**Step 3: Create recent calculations list** (`components/dashboard/recent-calculations.tsx`)

Compact list of recent calculations with name + price + date.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add dashboard with stats and recent calculations"
```

---

### Task 12: Landing Page

**Files:**
- Create: `app/page.tsx`
- Create: `components/landing/hero.tsx`
- Create: `components/landing/features.tsx`
- Create: `components/landing/pricing.tsx`
- Create: `components/landing/navbar.tsx`

**Step 1: Use frontend-design skill**

Invoke `superpowers:frontend-design` to create a high-quality landing page.

**Step 2: Create landing page sections**

- **Navbar:** Logo + CTA button
- **Hero:** Headline, subtitle, CTA buttons, mockup preview
- **Pain points:** 3 cards showing problems the product solves
- **Features:** 4 feature cards with icons
- **Pricing:** Single plan card R$29/mês with CTA
- **Footer:** Minimal footer

Design: Dark theme, accent green (#00e5a0), Inter + DM Mono fonts.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add landing page"
```

---

### Task 13: Final Polish + Deploy

**Files:**
- Modify: various files for polish
- Create: `app/not-found.tsx`

**Step 1: Add 404 page**

**Step 2: Add loading states**

Add `loading.tsx` files to key route segments for skeleton loading.

**Step 3: Test complete flow end-to-end**

1. Visit landing page
2. Register new account
3. See subscription page
4. Simulate webhook (or use real Lastlink)
5. Access dashboard
6. Create material + machine
7. Run calculation
8. Check history
9. Sign out

**Step 4: Deploy to Vercel**

Use `vercel:deploy` skill.

**Step 5: Configure Lastlink webhook URL**

Update Lastlink webhook to point to production URL: `https://<domain>.vercel.app/api/webhook/lastlink`

**Step 6: Final commit**

```bash
git add -A && git commit -m "feat: final polish and deploy preparation"
```
