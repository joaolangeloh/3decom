# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**3DEcom** is a SaaS web app for 3D printing price calculation. Users subscribe (via Lastlink payment) to access a pricing calculator hosted as a static HTML page served in an iframe.

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm start        # Start production server
```

No test or lint scripts are configured.

## Architecture

**Stack:** Next.js 14 (App Router) · TypeScript · NextAuth.js 4 (JWT/credentials) · Supabase (PostgreSQL) · Tailwind CSS · Lastlink payments · Deployed on Vercel

### User Flow

1. Unauthenticated → `/landing` (static HTML in iframe at `/public/landing.html`)
2. Register at `/auth/cadastro` → auto-login → `/assinar` (subscription page)
3. Payment via Lastlink → webhook activates subscription → `/dashboard`
4. Dashboard renders `/public/precificadora.html` in iframe (the actual calculator)

### Route Protection

`middleware.ts` protects `/dashboard/*` and `/app/*`: requires valid NextAuth JWT **and** `subscriptionStatus === 'active'`, otherwise redirects to `/assinar`.

### Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth config — credentials provider, JWT/session callbacks, subscription status fetched at login |
| `lib/supabase.ts` | Supabase admin client (service role) |
| `app/api/register/route.ts` | Registration: validates (Zod), bcrypt hash (12 rounds), creates user + inactive subscription |
| `app/api/webhook/lastlink/route.ts` | Payment webhook: validates `x-lastlink-token` header, updates subscription status |
| `middleware.ts` | Route protection via `withAuth()` |
| `supabase-schema.sql` | DB schema (users + subscriptions tables) |
| `public/precificadora.html` | The 3D print calculator (served via iframe in dashboard) |

### Database Schema

Two tables in Supabase:
- `users` — id (uuid), name, email (unique), password_hash, created_at
- `subscriptions` — id, user_id (FK → users, cascade delete), status (`active|inactive|canceled`), lastlink_subscription_id, current_period_end, timestamps

### Subscription Status Logic

Webhook events mapping in `/api/webhook/lastlink`:
- `paid | active | approved | created` → status `active`, expires in 30 days
- `cancel | expired | chargeback` → status `canceled`

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY       # Supabase admin key (server-only)
NEXTAUTH_URL                    # App URL (e.g. https://yourdomain.com)
NEXTAUTH_SECRET                 # Random secret for JWT signing
LASTLINK_WEBHOOK_TOKEN          # Validates incoming Lastlink webhook calls
NEXT_PUBLIC_LASTLINK_URL        # Lastlink checkout URL (public)
```

### Styling Conventions

- Dark theme: `#080810` / `#0e0e1a` backgrounds
- Accent: `#00e5a0` (cyan/teal)
- Mix of Tailwind classes and inline styles
- Font: Inter (Google Fonts, loaded in root layout)

### TypeScript Notes

- NextAuth types extended in `types/next-auth.d.ts` (adds `id` and `subscriptionStatus` to Session/JWT)
- Server components by default; `'use client'` only for interactive pages (login, cadastro, assinar)
- Path alias `@/*` maps to project root
