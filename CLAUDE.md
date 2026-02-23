# CLAUDE.md

## Project Overview
**3DEcom** is a SaaS web app for 3D printing price calculation. Users subscribe (R$29/mes via Lastlink) to access a pricing calculator, material/machine management, and calculation history.

## Commands
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm start        # Start production server
```

## Architecture
**Stack:** Next.js 15 (App Router) · TypeScript · Supabase Auth · Supabase PostgreSQL + RLS · @supabase/ssr · Tailwind CSS 4 · shadcn/ui · Lastlink payments · Vercel

### Key Directories
- `app/` — Next.js App Router pages and API routes
- `app/(protected)/` — Routes requiring auth + active subscription
- `components/` — React components (ui/ for shadcn, others for app-specific)
- `lib/` — Utilities (supabase clients, calculator logic, types)
- `lib/supabase/` — Supabase client utilities (client.ts, server.ts, admin.ts, middleware.ts)

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin key (server-only, for webhook)
- `LASTLINK_WEBHOOK_TOKEN` — Validates incoming Lastlink webhooks
- `NEXT_PUBLIC_LASTLINK_URL` — Lastlink checkout URL

### Design System
- Dark theme always: `#080810` bg, `#0e0e1a` surface, `#00e5a0` accent
- Fonts: Inter + DM Mono
- UI: shadcn/ui (New York style) customized with dark theme
- Path alias: `@/*` maps to project root
