# 🚀 Guia de Deploy — 3DEcom
## Do zero ao ar em ~45 minutos

---

## VISÃO GERAL DO QUE VOCÊ VAI CRIAR

```
GitHub (código) → Vercel (hospedagem) → Neon (banco de dados) → Stripe (pagamentos)
```

Cada vez que você alterar o código e enviar pro GitHub,
o Vercel atualiza o site automaticamente.

---

## ETAPA 1 — Criar conta no GitHub

1. Acesse **github.com** e clique em **Sign up**
2. Escolha um username (ex: `seunome3d`) e crie a conta
3. Confirme o email que eles enviam

**Criar o repositório:**
1. Clique no **+** no canto superior direito → **New repository**
2. Nome: `3decom`
3. Deixe como **Private** (código privado)
4. Clique em **Create repository**
5. Guarde a URL — ela será algo como `github.com/seunome3d/3decom`

---

## ETAPA 2 — Instalar Git e Node.js no seu computador

**Windows:**
- Baixe e instale o **Git**: https://git-scm.com/download/win
- Baixe e instale o **Node.js 20 LTS**: https://nodejs.org

**Mac:**
- Abra o Terminal e execute: `xcode-select --install`
- Depois instale o Node.js em: https://nodejs.org

**Verificar instalação** (abra o Terminal ou Prompt de Comando):
```bash
node --version   # deve mostrar v20.x.x
npm --version    # deve mostrar 10.x.x
git --version    # deve mostrar git version 2.x.x
```

---

## ETAPA 3 — Enviar o projeto pro GitHub

Abra o Terminal/Prompt na pasta do projeto `3decom` e execute:

```bash
# Instala as dependências
npm install

# Inicializa o Git no projeto
git init
git add .
git commit -m "projeto inicial 3decom"

# Conecta com o GitHub (substitua pela sua URL)
git remote add origin https://github.com/SEUNOME/3decom.git
git branch -M main
git push -u origin main
```

---

## ETAPA 4 — Criar banco de dados no Neon (gratuito)

1. Acesse **neon.tech** e clique em **Sign up** (pode entrar com o GitHub)
2. Clique em **Create Project**
3. Nome do projeto: `3decom`
4. Região: escolha **São Paulo** (aws-sa-east-1) se disponível, ou US East
5. Clique em **Create Project**
6. Na tela seguinte, copie a **Connection string** — ela começa com `postgresql://...`
   - Guarde isso! Você vai precisar em breve.

---

## ETAPA 5 — Criar conta no Stripe (pagamentos)

1. Acesse **stripe.com** e clique em **Start now**
2. Preencha os dados da sua empresa/MEI
3. Após entrar no painel:

**Criar o produto:**
1. No menu esquerdo, clique em **Products** → **Add product**
2. Nome: `3DEcom Pro`
3. Clique em **Add pricing** → tipo **Recurring** → **Monthly**
4. Preço: `29,00` → Moeda: `BRL`
5. Clique em **Save product**
6. Copie o **Price ID** — começa com `price_...`

**Pegar as chaves de API:**
1. No menu esquerdo, clique em **Developers** → **API Keys**
2. Copie a **Secret key** (começa com `sk_live_...`)
   - ⚠️ Use `sk_test_...` para testes primeiro!

**Configurar o Webhook:**
(você vai voltar aqui depois de criar o Vercel)

---

## ETAPA 6 — Criar conta no Vercel e fazer o deploy

1. Acesse **vercel.com** e clique em **Sign up** → entre com o **GitHub**
2. Clique em **Add New Project**
3. Encontre o repositório `3decom` e clique em **Import**
4. Em **Framework Preset**, selecione **Next.js**
5. **NÃO clique em Deploy ainda** — primeiro configure as variáveis de ambiente

**Configurar variáveis de ambiente no Vercel:**
Clique em **Environment Variables** e adicione uma por uma:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | sua connection string do Neon |
| `NEXTAUTH_SECRET` | veja como gerar abaixo |
| `NEXTAUTH_URL` | `https://SEUSITE.vercel.app` (você descobre após o deploy) |
| `STRIPE_SECRET_KEY` | `sk_test_...` do Stripe |
| `STRIPE_WEBHOOK_SECRET` | veja abaixo |
| `STRIPE_PRICE_ID` | `price_...` do Stripe |
| `NEXT_PUBLIC_STRIPE_SUCCESS_URL` | `https://SEUSITE.vercel.app/app/precificar` |
| `NEXT_PUBLIC_STRIPE_CANCEL_URL` | `https://SEUSITE.vercel.app/auth/cadastro` |
| `NEXT_PUBLIC_APP_URL` | `https://SEUSITE.vercel.app` |

**Gerar o NEXTAUTH_SECRET:**
Execute no terminal:
```bash
openssl rand -base64 32
```
Copie o resultado e cole no Vercel.

**Agora clique em Deploy!**
O Vercel vai construir o projeto. Aguarde ~2 minutos.
Você receberá uma URL como `3decom-abc123.vercel.app`.

---

## ETAPA 7 — Criar as tabelas no banco de dados

Após o deploy, execute no terminal (na pasta do projeto):

```bash
# Cria o arquivo .env.local com suas variáveis
cp .env.example .env.local
# Edite o arquivo .env.local com seus valores reais

# Cria as tabelas no banco
npx prisma db push
```

---

## ETAPA 8 — Configurar o Webhook do Stripe

O webhook avisa seu sistema quando alguém paga ou cancela.

1. No Stripe, vá em **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://SEUSITE.vercel.app/api/webhook`
3. Em **Events to listen**, selecione:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Clique em **Add endpoint**
5. Copie o **Signing secret** (começa com `whsec_...`)
6. Volte no Vercel → **Settings** → **Environment Variables**
7. Adicione `STRIPE_WEBHOOK_SECRET` com esse valor
8. No Vercel, vá em **Deployments** → clique nos 3 pontos → **Redeploy**

---

## ETAPA 9 — Atualizar NEXTAUTH_URL

Após o deploy, você saberá a URL final do site.
1. Volte no Vercel → **Settings** → **Environment Variables**
2. Edite `NEXTAUTH_URL` com a URL real: `https://3decom.vercel.app`
3. Faça redeploy

---

## ETAPA 10 — Testar tudo

1. Acesse `https://SEUSITE.vercel.app`
2. Clique em **Criar conta grátis (7 dias)**
3. Preencha os dados e clique em continuar
4. Use o cartão de teste do Stripe: `4242 4242 4242 4242` / qualquer data futura / qualquer CVV
5. Após o pagamento, você deve ser redirecionado para a precificadora ✅

---

## COMO ATUALIZAR O SITE NO FUTURO

Sempre que quiser mudar algo:

```bash
# Faça suas alterações nos arquivos
git add .
git commit -m "descrição do que mudou"
git push
```

O Vercel detecta automaticamente e atualiza o site em ~2 minutos.

---

## DOMÍNIO PRÓPRIO (opcional)

Para usar `3decom.com.br` em vez de `3decom.vercel.app`:
1. Compre o domínio em **registro.br** ou **GoDaddy**
2. No Vercel → **Settings** → **Domains** → **Add domain**
3. Siga as instruções para apontar o DNS

---

## PRECISA DE AJUDA?

Se travar em algum passo, volte aqui e descreva exatamente onde parou.
O mais comum de dar problema é nas variáveis de ambiente — confira se não tem
espaços extras ou aspas nos valores.

---

## RESUMO DE CUSTOS MENSAIS

| Serviço | Custo |
|---------|-------|
| Vercel (Hobby) | **Grátis** |
| Neon Postgres (Free tier) | **Grátis** até 0,5GB |
| Stripe | **0% +** 2,49% por transação bem-sucedida |
| Domínio .com.br | ~R$ 40/ano (opcional) |

**Total para começar: R$ 0/mês** 🎉
