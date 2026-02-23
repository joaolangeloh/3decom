# 3DEcom — Precificadora para Impressão 3D

## Deploy rápido

### 1. Supabase — rodar o schema
No painel do Supabase, vá em **SQL Editor** e execute o conteúdo de `supabase-schema.sql`.

Depois vá em **Settings → API** e copie:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Variáveis de ambiente na Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://goaqytqhvnkyrohuiznx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<pegar no Supabase Settings > API>
NEXTAUTH_URL=https://<seu-dominio>.vercel.app
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
LASTLINK_WEBHOOK_TOKEN=7777d813e6f74738ad4c4cd703079499
NEXT_PUBLIC_LASTLINK_URL=<link do produto no Lastlink>
```

### 3. Webhook no Lastlink
URL: `https://<seu-dominio>.vercel.app/api/webhook/lastlink`

### 4. Fluxo do usuário
1. Acessa o site → landing page
2. Clica "Assinar" → vai para o Lastlink
3. Paga → Lastlink chama o webhook → acesso liberado no Supabase
4. Faz login → acessa a calculadora no dashboard
