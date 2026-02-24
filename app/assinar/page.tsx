import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ReloadButton } from './reload-button'

export const metadata = { title: 'Assinar' }

function buildCheckoutUrl(base: string, email: string, name?: string | null) {
  const params = new URLSearchParams()
  params.set('email', email)
  if (name) params.set('name', name)
  return `${base}?${params.toString()}`
}

const features = [
  'Precificações ilimitadas',
  'Shopee + Mercado Livre 2026',
  'Detalhamento cascata completo',
  'Capacidade produtiva da impressora',
  'Calculadora de promoção',
  'Cupom próprio Shopee',
  'Histórico de precificações',
  'Preferências salvas',
  'Perfis Bambu Lab prontos',
  'Atualização de taxas automática',
]

export default async function AssinarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (subscription?.status === 'active') redirect('/calculadora')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const email = user.email ?? ''
  const name = profile?.name

  const annualBase = process.env.NEXT_PUBLIC_LASTLINK_ANNUAL_URL || '#'
  const monthlyBase = process.env.NEXT_PUBLIC_LASTLINK_URL || '#'
  const annualUrl = buildCheckoutUrl(annualBase, email, name)
  const monthlyUrl = buildCheckoutUrl(monthlyBase, email, name)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060609] px-4 py-12">
      <div className="w-full max-w-[820px]">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-2 text-3xl font-extrabold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </div>
          <p className="font-mono text-xs tracking-[2px] uppercase text-[#555578]">
            Precificadora para Impressão 3D
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Anual — destaque */}
          <div className="bg-gradient-to-br from-[rgba(0,229,160,0.07)] to-[#13131f] border border-[rgba(0,229,160,0.3)] rounded-3xl p-5 sm:p-8 relative overflow-hidden transition-all hover:-translate-y-1 order-1">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e5a0] to-[#00c87a]" />
            <span className="absolute top-4 right-4 bg-[#00e5a0] text-black font-mono text-[9px] font-bold tracking-[1px] px-2.5 py-1 rounded-full uppercase">
              MELHOR VALOR
            </span>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#555578] mb-4">
              Plano Anual
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-lg font-bold text-[#b0b0cc]">R$</span>
              <span className="text-[clamp(36px,8vw,56px)] font-extrabold tracking-[-3px] text-white">
                290
              </span>
              <span className="font-mono text-[13px] text-[#555578]">/ano</span>
            </div>
            <div className="font-mono text-[11px] text-[#00e5a0] mb-6">
              = R$ 24,17/mês &middot;{' '}
              <strong>2 meses grátis incluídos</strong>
            </div>
            <div className="font-mono text-[11px] text-[#b0b0cc] mb-6 p-2.5 bg-[rgba(0,229,160,0.07)] rounded-lg border border-[rgba(0,229,160,0.2)]">
              &#128176; Garantia de 7 dias &middot; Economize R$ 58 por ano
            </div>
            <hr className="border-[#1e1e30] my-5" />
            <div className="flex flex-col gap-2.5 mb-7">
              {[
                { text: 'Tudo do plano mensal', bold: true },
                { text: '2 meses grátis (paga 10, usa 12)', accent: true },
                { text: 'Economia de R$ 58/ano', accent: true },
                { text: 'Acesso prioritário a novidades' },
                { text: 'Suporte prioritário por email' },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-start gap-2.5 font-mono text-xs text-[#b0b0cc]"
                >
                  <span className="text-[#00e5a0] shrink-0 mt-px">
                    &#10003;
                  </span>
                  <span
                    className={
                      f.bold
                        ? 'text-[#ededf8] font-bold'
                        : f.accent
                          ? 'text-[#00e5a0] font-bold'
                          : ''
                    }
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={annualUrl}
              target="_blank"
              className="block w-full text-center py-4 rounded-[13px] font-extrabold text-[15px] bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,229,160,0.3)]"
            >
              &rarr; Assinar anual e economizar
            </Link>
          </div>

          {/* Mensal */}
          <div className="bg-[#13131f] border border-[#1e1e30] rounded-3xl p-5 sm:p-8 relative overflow-hidden transition-all hover:-translate-y-1 order-2">
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#555578] mb-4">
              Plano Mensal
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-lg font-bold text-[#b0b0cc]">R$</span>
              <span className="text-[clamp(36px,8vw,56px)] font-extrabold tracking-[-3px] text-white">
                29
              </span>
              <span className="font-mono text-[13px] text-[#555578]">
                /mês
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#00e5a0] mb-6 min-h-[20px]">
              {'\u00A0'}
            </div>
            <div className="font-mono text-[11px] text-[#b0b0cc] mb-6 p-2.5 bg-[rgba(0,229,160,0.08)] rounded-lg border border-[rgba(0,229,160,0.15)]">
              &#128176; Garantia de 7 dias &middot; Reembolso total se não
              gostar
            </div>
            <hr className="border-[#1e1e30] my-5" />
            <div className="flex flex-col gap-2.5 mb-7">
              {features.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2.5 font-mono text-xs text-[#b0b0cc]"
                >
                  <span className="text-[#00e5a0] shrink-0 mt-px">
                    &#10003;
                  </span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link
              href={monthlyUrl}
              target="_blank"
              className="block w-full text-center py-4 rounded-[13px] font-extrabold text-[15px] bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,229,160,0.3)]"
            >
              &rarr; Assinar com garantia de 7 dias
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="text-center font-mono text-[11px] text-[#555578] flex items-center justify-center gap-1.5 flex-wrap">
            &#128274; Pagamento seguro &nbsp;&middot;&nbsp; Cancele quando
            quiser &nbsp;&middot;&nbsp; Sem fidelidade
          </div>
          <ReloadButton />
          <p className="text-center text-xs text-[#555578]">
            Após o pagamento, sua assinatura será ativada automaticamente
          </p>
        </div>
      </div>
    </div>
  )
}
