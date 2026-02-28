'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ============================================================
// Intersection Observer hook for scroll animations
// ============================================================

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, inView }
}

function Anim({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ============================================================
// FAQ Item
// ============================================================

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`border rounded-[14px] overflow-hidden transition-colors ${
        open ? 'border-[#2a2a40]' : 'border-[#1e1e30]'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full justify-between items-center px-5 py-4 text-left text-[15px] font-semibold gap-4 transition-colors hover:bg-[#13131f] cursor-pointer"
      >
        <span>{question}</span>
        <span
          className={`text-lg shrink-0 transition-transform ${
            open ? 'rotate-45 text-[#00e5a0]' : 'text-[#555578]'
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 font-mono text-[13px] text-[#b0b0cc] leading-[1.8]">
          {answer}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Waterfall line (for mockup)
// ============================================================

function WaterfallLine({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <div className="flex gap-0 items-stretch mb-0.5">
      <div className="w-[18px] relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#2a2a40]" />
        <div
          className="absolute bottom-2 left-[calc(50%-4px)] w-2 h-2 border-l border-b border-[#2a2a40]"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </div>
      <div className="flex-1 flex justify-between items-center py-[7px] px-[11px] rounded-lg border border-[#1e1e30] bg-[#0a0a12]">
        <span className="text-[11px] text-[#b0b0cc] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
          {label}
        </span>
        <span className="font-mono text-[11px] text-[#ff3f5e]">{value}</span>
      </div>
    </div>
  )
}

// ============================================================
// Main Landing Page
// ============================================================

export default function LandingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-[#060609] text-[#ededf8] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 h-16 flex items-center justify-between bg-[rgba(6,6,9,0.9)] backdrop-blur-[16px] border-b border-white/[0.04]">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[22px] font-extrabold tracking-tight">
            3D<span className="text-[#00e5a0]">Ecom</span>
          </span>
          <span className="text-[8px] font-normal text-[#555578] tracking-[1.5px] uppercase font-mono mt-px">
            precificadora automática
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-7">
          <a href="#funcoes" className="text-[13px] font-semibold text-[#555578] hover:text-[#b0b0cc] transition-colors">Funções</a>
          <a href="#taxas" className="text-[13px] font-semibold text-[#555578] hover:text-[#b0b0cc] transition-colors">Taxas 2026</a>
          <a href="#precos" className="text-[13px] font-semibold text-[#555578] hover:text-[#b0b0cc] transition-colors">Preços</a>
          <a href="#faq" className="text-[13px] font-semibold text-[#555578] hover:text-[#b0b0cc] transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-[13px] font-semibold text-[#b0b0cc] hover:text-white transition-colors"
          >
            Login
          </Link>
          <a
            href="#precos"
            className="bg-[#00e5a0] text-black font-extrabold text-[13px] px-5 py-2.5 rounded-[10px] hover:bg-[#00c87a] transition-all hover:-translate-y-px"
          >
            Assinar agora &rarr;
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 overflow-hidden relative">
        {/* Glows */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(0,229,160,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(255,81,38,0.07),transparent_60%)] pointer-events-none" />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.2)] rounded-full px-4 py-[7px] font-mono text-[11px] text-[#00e5a0] mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          Taxas oficiais Shopee & ML &middot; Atualizado 2026
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-[clamp(36px,7vw,80px)] font-extrabold tracking-[-3px] leading-none mb-6 max-w-[900px]">
          Chega de vender<br />
          <span className="relative text-[#555578]">
            no chute
            <span className="absolute top-1/2 -left-1 -right-1 h-[3px] bg-[#ff3f5e]" style={{ transform: 'rotate(-2deg)' }} />
          </span>{' '}
          e<br />
          <em className="not-italic text-[#00e5a0]">perder dinheiro</em>
        </h1>

        {/* Sub */}
        <p className="relative z-10 font-mono text-[clamp(13px,2vw,16px)] text-[#b0b0cc] leading-[1.7] max-w-[580px] mb-10">
          A calculadora de preços feita especificamente para quem vende peças de impressão 3D.<br />
          <strong className="text-[#ededf8]">Taxas reais. Margem real. Lucro real.</strong>
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex gap-3 items-center flex-wrap justify-center mb-12">
          <a
            href="#precos"
            className="bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black font-extrabold text-base px-9 py-[18px] rounded-[14px] inline-flex items-center gap-2.5 tracking-[-0.3px] transition-all hover:-translate-y-[3px] hover:shadow-[0_20px_50px_rgba(0,229,160,0.3)]"
          >
            &#128640; Ver planos e assinar
          </a>
          <a
            href="#funcoes"
            className="text-[#b0b0cc] font-semibold text-[15px] px-7 py-[17px] rounded-[14px] border border-[#2a2a40] transition-all hover:text-[#ededf8] hover:bg-[#13131f]"
          >
            Ver como funciona
          </a>
        </div>

        {/* Proof */}
        <div className="relative z-10 flex items-center gap-5 font-mono text-[11px] text-[#555578] flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <span className="text-[#ffb020] tracking-[2px]">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          </span>
          <span className="flex items-center gap-1">&#10003; Reembolso em 7 dias</span>
          <span className="flex items-center gap-1">&#10003; Shopee + Mercado Livre</span>
          <span className="flex items-center gap-1">&#10003; Cancele quando quiser</span>
        </div>

        {/* Mockup */}
        <div className="w-full max-w-[900px] mt-15 relative z-10">
          {/* Browser bar */}
          <div className="bg-[#13131f] border border-[#2a2a40] rounded-t-[14px] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex-1 bg-[#0a0a12] rounded-md px-3 py-[5px] font-mono text-[11px] text-[#555578] text-center mx-3">
              precificadora3decom.com.br/calculadora
            </div>
          </div>
          {/* Screen */}
          <div className="bg-[#0a0a12] border border-[#1e1e30] border-t-0 rounded-b-[14px] p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left: Marketplace + Costs */}
            <div className="space-y-3">
              {/* Marketplace selector */}
              <div className="bg-[#13131f] border border-[#2a2a40] rounded-xl p-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#555578] mb-2.5">1 · Marketplace</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="rounded-lg border border-[rgba(255,230,0,0.3)] bg-[rgba(255,230,0,0.05)] p-2 text-center">
                    <span className="text-[11px] font-semibold text-[#ffe600] block">ML</span>
                    <span className="text-[8px] text-[#555578]">Premium</span>
                  </div>
                  <div className="rounded-lg border border-[#2a2a40] p-2 text-center">
                    <span className="text-[11px] font-semibold text-[#555578] block">Shopee</span>
                    <span className="text-[8px] text-[#555578]">2026</span>
                  </div>
                  <div className="rounded-lg border border-[#2a2a40] p-2 text-center">
                    <span className="text-[11px] font-semibold text-[#555578] block">Direta</span>
                    <span className="text-[8px] text-[#555578]">Pix/Cartão</span>
                  </div>
                </div>
              </div>

              {/* Preço & Impressão */}
              <div className="bg-[#13131f] border border-[#2a2a40] rounded-xl p-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#555578] mb-2.5">2 · Preço & custos</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#b0b0cc]">Preço de venda</span>
                    <span className="text-[#ededf8] font-bold">R$ 74,90</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#b0b0cc]">Impressora</span>
                    <span className="text-[#555578]">Bambu P1S · 2h30</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#b0b0cc]">Filamento</span>
                    <span className="text-[#555578]">85g · R$80/kg</span>
                  </div>
                </div>
              </div>

              {/* Promoção */}
              <div className="bg-[#13131f] border border-[#2a2a40] rounded-xl p-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#555578] mb-2">Promoção com lucro preservado</div>
                <div className="flex justify-between mt-2">
                  <div>
                    <div className="font-mono text-[10px] text-[#555578]">Anunciar por</div>
                    <div className="font-mono text-base font-extrabold text-[#c084fc] mt-0.5">R$ 83,22</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-[#555578]">Cliente paga</div>
                    <div className="font-mono text-base font-extrabold text-[#ededf8] mt-0.5">R$ 74,90</div>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#555578] mt-2">&#128156; 10% de desconto &middot; lucro intacto</div>
              </div>
            </div>

            {/* Right: Detalhamento + Lucro */}
            <div className="space-y-3">
              {/* Detalhamento cascata */}
              <div className="bg-[#13131f] border border-[#2a2a40] rounded-xl p-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#555578] mb-2">Detalhamento</div>
                {[
                  ['🏷️ Preço de venda', 'R$ 74,90', '#ededf8', '700'],
                  ['└─ Taxa ML Premium (19%)', '− R$ 14,23', null, null],
                  ['└─ Frete (0,5kg)', '− R$ 6,50', null, null],
                  ['└─ Imposto (6%)', '− R$ 4,49', null, null],
                  ['└─ Energia elétrica', '− R$ 0,85', null, null],
                  ['└─ Filamento (85g)', '− R$ 6,80', null, null],
                  ['└─ Embalagem', '− R$ 2,38', null, null],
                ].map(([label, value, color, weight], i) => (
                  <div
                    key={i}
                    className="flex justify-between font-mono text-[10px] text-[#b0b0cc] py-1 border-b border-[#1e1e30] last:border-0"
                    style={color ? { color, fontWeight: Number(weight) } : undefined}
                  >
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              {/* Lucro */}
              <div className="bg-[rgba(0,229,160,0.07)] border border-[rgba(0,229,160,0.25)] rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[#00e5a0] text-sm">&#8593;</span>
                  <span className="text-[11px] font-bold text-[#00e5a0]">Lucro líquido</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-[#00e5a0]">R$ 39,65</span>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-[#00e5a0]">52,9%</span>
                    <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[rgba(0,229,160,0.15)] text-[#00e5a0]">Excelente</span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#555578] mt-1.5">R$ 15,86/hora · R$ 317/dia (20h)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOR ===== */}
      <section className="py-24 px-6 relative bg-[#0a0a12]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2a40] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2a40] to-transparent" />
        <div className="max-w-[1040px] mx-auto">
          <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">O problema</div>
          <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-4">
            Você sabe quanto<br />
            <em className="not-italic text-[#ff3f5e]">realmente ganha</em><br />
            por peça?
          </h2>
          <p className="font-mono text-sm text-[#b0b0cc] leading-[1.8] max-w-[560px] mb-12">
            A maioria vende, vende e vende — e no fim do mês olha para a conta e pensa:{' '}
            <strong className="text-[#ededf8]">por que não sobrou nada?</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { emoji: '&#128580;', num: '01', title: 'Taxa que você não via', desc: 'ML cobra comissão, custo fixo por faixa E desconta frete no Premium. Shopee tem subsídio Pix, adicional CPF e campanha. Tudo somado: 25-35% do preço.' },
              { emoji: '&#129318;', num: '02', title: 'Precificação no feeling', desc: '"Custo R$12 de filamento, vendo por R$45." E a energia? As 3h de máquina? Os 19% do ML Premium? Sobrou quanto mesmo?' },
              { emoji: '&#128202;', num: '03', title: 'Promoção que destrói margem', desc: '15% de desconto numa campanha sem ajustar o preço base? Parabéns: você acabou de trabalhar de graça ou pior, pagou para vender.' },
            ].map((p) => (
              <Anim key={p.num}>
                <div className="bg-[#13131f] border border-[#1e1e30] rounded-[18px] p-[26px] relative overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#2a2a40]">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ff3f5e] to-transparent" />
                  <span className="absolute top-[18px] right-[18px] font-mono text-[10px] text-[#2a2a40]">{p.num}</span>
                  <span className="text-[32px] block mb-3.5" dangerouslySetInnerHTML={{ __html: p.emoji }} />
                  <h3 className="text-base font-bold mb-2">{p.title}</h3>
                  <p className="font-mono text-xs text-[#555578] leading-[1.7]">{p.desc}</p>
                </div>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-6" id="funcoes">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">O que o 3DEcom faz</div>
            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-4">
              Tudo que você precisa<br />para precificar <em className="not-italic text-[#00e5a0]">com segurança</em>
            </h2>
          </div>

          {/* Highlight: Waterfall */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center mt-20 mb-20">
            <div>
              <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">Detalhamento cascata</div>
              <h3 className="text-[clamp(22px,4vw,36px)] font-extrabold tracking-tight leading-[1.1] mb-3.5">
                Do preço de venda<br />até o lucro real —<br /><em className="not-italic text-[#00e5a0]">linha por linha</em>
              </h3>
              <p className="font-mono text-[13px] text-[#b0b0cc] leading-[1.8] mb-5">
                Cada real descontado aparece na ordem certa. Taxa, frete, imposto, energia, filamento, embalagem. Você vê{' '}
                <strong className="text-[#ededf8]">exatamente onde vai cada centavo</strong> antes de publicar.
              </p>
              <span className="inline-block font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full bg-[rgba(0,229,160,0.08)] text-[#00e5a0] border border-[rgba(0,229,160,0.2)]">
                &#10003; Atualizado com taxas 2026
              </span>
            </div>
            <div className="bg-[#13131f] border border-[#2a2a40] rounded-[20px] p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e5a0] to-transparent" />
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#555578] mb-3.5">Exemplo &middot; Shopee CPF &middot; R$ 49,90</div>
              {/* Top bar */}
              <div className="flex justify-between items-center bg-[#0a0a12] border border-[#2a2a40] rounded-[10px] px-3.5 py-3 mb-1.5">
                <span className="text-[13px] font-bold">🏷️ Preço de venda</span>
                <span className="font-mono text-base font-extrabold">R$ 49,90</span>
              </div>
              <WaterfallLine label="Taxa Shopee (20%)" value="&minus; R$ 9,98" dotColor="#ffb020" />
              <WaterfallLine label="Frete estimado" value="&minus; R$ 5,00" dotColor="#aa88ff" />
              <WaterfallLine label="Imposto (6%)" value="&minus; R$ 2,99" dotColor="#ff6666" />
              <WaterfallLine label="Energia elétrica" value="&minus; R$ 0,85" dotColor="#4488ff" />
              <WaterfallLine label="Filamento" value="&minus; R$ 8,00" dotColor="#ff88aa" />
              {/* Result */}
              <div className="flex justify-between items-center px-3.5 py-3 rounded-[10px] bg-[rgba(0,229,160,0.07)] border-2 border-[rgba(0,229,160,0.25)] mt-1.5">
                <span className="text-[13px] font-bold">&#9989; Lucro líquido</span>
                <span className="font-mono text-xl font-extrabold text-[#00e5a0]">R$ 23,08</span>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { icon: '&#127981;', title: 'Capacidade produtiva real', desc: 'Quanto sua impressora gera de lucro e faturamento por hora, por dia e por mês? Decida se vale imprimir essa peça ou trocar por uma mais rentável.', tag: 'Lucro/hora · Faturamento/dia · Potencial mensal', tagType: 'g', featured: true },
              { icon: '&#128156;', title: 'Promoção sem perder margem', desc: 'Quer dar 15% de desconto? O 3DEcom calcula o preço a anunciar para que, após o desconto, seu lucro fique intacto. Simples assim.', tag: 'Cupom próprio + Preço inflacionado automático', tagType: 'p', featured: false },
              { icon: '&#127919;', title: 'Calcular por margem desejada', desc: 'Defina a margem que quer (ex: 30%) e o sistema calcula automaticamente o preço de venda correto, já com todas as taxas incluídas.', tag: 'Algoritmo iterativo com convergência automática', tagType: 'g', featured: false },
              { icon: '&#9881;&#65039;', title: 'Preferências salvas', desc: 'kWh, filamento, impressora, imposto — configure uma vez, use em todas as precificações. Sem reconfigurar do zero toda vez.', tag: 'Sincronizado em qualquer dispositivo', tagType: 'g', featured: false },
              { icon: '&#128203;', title: 'Histórico de precificações', desc: 'Cada precificação salva com todos os detalhes. Compare produtos, veja a evolução das margens e nunca perca uma referência de preço.', tag: 'Reabra e edite cálculos antigos', tagType: 'g', featured: false },
              { icon: '&#128424;&#65039;', title: 'Perfis Bambu Lab prontos', desc: 'A1 Mini, A1, P1P, P1S, X1 Carbon e H2D — cada impressora com seu consumo energético real pré-configurado. Selecione e pronto.', tag: 'Energia calculada com precisão real', tagType: 'g', featured: false },
            ].map((f) => (
              <Anim key={f.title}>
                <div
                  className={`rounded-[20px] p-7 transition-all hover:-translate-y-[3px] hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)] relative overflow-hidden h-full ${
                    f.featured
                      ? 'border border-[rgba(0,229,160,0.25)] bg-gradient-to-br from-[rgba(0,229,160,0.05)] to-[#13131f]'
                      : 'bg-[#13131f] border border-[#1e1e30] hover:border-[#2a2a40]'
                  }`}
                >
                  {f.featured && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e5a0] to-transparent" />}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-4 border ${
                      f.featured
                        ? 'bg-[rgba(0,229,160,0.08)] border-[rgba(0,229,160,0.25)]'
                        : 'bg-[#1a1a2a] border-[#2a2a40]'
                    }`}
                    dangerouslySetInnerHTML={{ __html: f.icon }}
                  />
                  <h3 className="text-lg font-bold mb-2.5 tracking-tight">{f.title}</h3>
                  <p className="font-mono text-xs text-[#b0b0cc] leading-[1.8]">{f.desc}</p>
                  <span
                    className={`inline-block mt-3.5 font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full border ${
                      f.tagType === 'g'
                        ? 'bg-[rgba(0,229,160,0.08)] text-[#00e5a0] border-[rgba(0,229,160,0.2)]'
                        : 'bg-[rgba(192,132,252,0.08)] text-[#c084fc] border-[rgba(192,132,252,0.2)]'
                    }`}
                  >
                    {f.tag}
                  </span>
                </div>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TAXAS ===== */}
      <section className="py-24 px-6 bg-[#0a0a12] relative" id="taxas">
        <div className="max-w-[1040px] mx-auto">
          <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">Taxas oficiais 2026</div>
          <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-4">
            Sempre atualizado.<br /><em className="not-italic text-[#00e5a0]">Sem surpresas.</em>
          </h2>
          <p className="font-mono text-sm text-[#b0b0cc] leading-[1.8] max-w-[560px] mb-12">
            Todas as tabelas são revisadas a cada atualização dos marketplaces. Você nunca calcula com dados desatualizados.
          </p>
        </div>
      </section>

      {/* ===== PROOF ===== */}
      <section className="py-24 px-6" id="prova">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">Resultados reais</div>
            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-12">
              Quem usa <em className="not-italic text-[#00e5a0]">para de adivinhar</em>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-16">
            {[
              ['+R$8k', 'lucro recuperado/mês em média'],
              ['2min', 'para precificar um produto novo'],
              ['0', 'surpresas na fatura do marketplace'],
              ['2026', 'tabelas sempre atualizadas'],
            ].map(([val, label]) => (
              <Anim key={val}>
                <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl p-[22px] text-center">
                  <div className="text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-2px] text-[#00e5a0] mb-1.5">{val}</div>
                  <div className="font-mono text-[11px] text-[#555578]">{label}</div>
                </div>
              </Anim>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                text: '"Descobri que estava vendendo meu produto mais popular com <strong>R$ 3 de prejuízo por peça</strong>. Achava que estava lucrando 20%. O 3DEcom abriu meu olho."',
                name: 'Rafael M.',
                role: 'Vendedor Shopee · PE',
                avatar: '&#128310;',
              },
              {
                text: '"Antes de entrar em qualquer campanha, calculo o preço com a função de promoção. <strong>Nunca mais trabalhei de graça</strong> numa campanha da Shopee."',
                name: 'Camila R.',
                role: 'Bambu P1S · SP',
                avatar: '&#128994;',
              },
              {
                text: '"O cálculo de capacidade produtiva mudou como escolho o que imprimir. <strong>Foco nas peças com maior lucro/hora</strong>, não nas mais baratas de fazer."',
                name: 'Lucas F.',
                role: 'ML Premium · RS',
                avatar: '&#128309;',
              },
            ].map((t) => (
              <Anim key={t.name}>
                <div className="bg-[#13131f] border border-[#1e1e30] rounded-[18px] p-6 transition-all hover:-translate-y-0.5 hover:border-[#2a2a40] h-full flex flex-col">
                  <div className="text-[#ffb020] text-sm tracking-[2px] mb-3.5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                  <p
                    className="font-mono text-xs text-[#b0b0cc] leading-[1.8] mb-[18px] flex-1 [&_strong]:text-[#00e5a0]"
                    dangerouslySetInnerHTML={{ __html: t.text }}
                  />
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full bg-[#1a1a2a] border border-[#2a2a40] flex items-center justify-center text-sm shrink-0"
                      dangerouslySetInnerHTML={{ __html: t.avatar }}
                    />
                    <div>
                      <div className="text-[13px] font-bold">{t.name}</div>
                      <div className="font-mono text-[10px] text-[#555578] mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-6 bg-[#0a0a12] relative" id="precos">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">Planos</div>
            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-4">
              Simples. <em className="not-italic text-[#00e5a0]">Sem surpresas.</em>
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[820px] mt-12 mx-auto">
            {/* Mensal card */}
            <div className="bg-[#13131f] border border-[#1e1e30] rounded-3xl p-8 relative overflow-hidden transition-all hover:-translate-y-1">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#555578] mb-4">
                Plano Mensal
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-bold text-[#555578] line-through decoration-[#ff3f5e] decoration-2">R$ 58</span>
                <span className="bg-[#ff3f5e] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">-50%</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-lg font-bold text-[#b0b0cc]">R$</span>
                <span className="text-[clamp(44px,8vw,64px)] font-extrabold tracking-[-3px]">
                  29
                </span>
                <span className="font-mono text-[13px] text-[#555578]">
                  /mês
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#ff3f5e] mb-6">
                &#128293; <strong>Promoção de lançamento</strong> &middot; 50% OFF
              </div>
              <div className="font-mono text-[11px] text-[#b0b0cc] mb-6 p-2.5 bg-[rgba(0,229,160,0.08)] rounded-lg border border-[rgba(0,229,160,0.15)]">
                &#128176; Garantia de 7 dias &middot; Reembolso total se não gostar
              </div>
              <hr className="border-[#1e1e30] my-5" />
              <div className="flex flex-col gap-2.5 mb-7">
                {[
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
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 font-mono text-xs text-[#b0b0cc]">
                    <span className="text-[#00e5a0] shrink-0 mt-px">&#10003;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/cadastro"
                className="block w-full text-center py-4 rounded-[13px] font-extrabold text-[15px] bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,229,160,0.3)]"
              >
                &rarr; Assinar com garantia de 7 dias
              </Link>
            </div>

            {/* Anual card */}
            <div className="bg-gradient-to-br from-[rgba(0,229,160,0.07)] to-[#13131f] border border-[rgba(0,229,160,0.3)] rounded-3xl p-8 relative overflow-hidden transition-all hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e5a0] to-[#00c87a]" />
              <span className="absolute top-4 right-4 bg-[#00e5a0] text-black font-mono text-[9px] font-bold tracking-[1px] px-2.5 py-1 rounded-full uppercase">
                MELHOR VALOR
              </span>
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#555578] mb-4">Plano Anual</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-bold text-[#555578] line-through decoration-[#ff3f5e] decoration-2">R$ 696</span>
                <span className="bg-[#ff3f5e] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">-58%</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-lg font-bold text-[#b0b0cc]">R$</span>
                <span className="text-[clamp(44px,8vw,64px)] font-extrabold tracking-[-3px]">290</span>
                <span className="font-mono text-[13px] text-[#555578]">/ano</span>
              </div>
              <div className="font-mono text-[11px] text-[#ff3f5e] mb-6">
                &#128293; <strong>Promoção de lançamento</strong> &middot; 58% OFF
              </div>
              <div className="font-mono text-[11px] text-[#b0b0cc] mb-6 p-2.5 bg-[rgba(0,229,160,0.07)] rounded-lg border border-[rgba(0,229,160,0.2)]">
                &#128176; Garantia de 7 dias &middot; = R$ 24,17/mês
              </div>
              <hr className="border-[#1e1e30] my-5" />
              <div className="flex flex-col gap-2.5 mb-7">
                {[
                  { text: 'Tudo do plano mensal', bold: true },
                  { text: '2 meses grátis (paga 10, usa 12)', accent: true },
                  { text: 'Economia de R$406/ano', accent: true },
                  { text: 'Acesso prioritário a novidades', bold: false },
                  { text: 'Suporte prioritário por email', bold: false },
                ].map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5 font-mono text-xs text-[#b0b0cc]">
                    <span className="text-[#00e5a0] shrink-0 mt-px">&#10003;</span>
                    <span className={f.bold ? 'text-[#ededf8] font-bold' : f.accent ? 'text-[#00e5a0] font-bold' : ''}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/cadastro"
                className="block w-full text-center py-4 rounded-[13px] font-extrabold text-[15px] bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,229,160,0.3)]"
              >
                &rarr; Assinar anual e economizar
              </Link>
            </div>
          </div>

          <div className="text-center font-mono text-[11px] text-[#555578] mt-6 flex items-center justify-center gap-1.5 flex-wrap">
            &#128274; Pagamento seguro &nbsp;&middot;&nbsp; Cancele quando quiser &nbsp;&middot;&nbsp; Sem fidelidade &nbsp;&middot;&nbsp; Dados protegidos
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 px-6" id="faq">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-[#00e5a0] mb-3">Dúvidas</div>
            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-[-2px] leading-[1.1] mb-12">
              Perguntas <em className="not-italic text-[#00e5a0]">frequentes</em>
            </h2>
          </div>

          <div className="max-w-[680px] mx-auto flex flex-col gap-1">
            <FaqItem
              question="E se eu não gostar do serviço?"
              answer="Sem problema. Você tem garantia de reembolso de 7 dias. Se não ficar satisfeito, devolvemos 100% do valor pago — sem perguntas e sem burocracia."
            />
            <FaqItem
              question="As taxas são mesmo as oficiais de 2026?"
              answer="Sim. As tabelas são baseadas na documentação oficial de Shopee e Mercado Livre. Revisamos e atualizamos sempre que os marketplaces publicam novas tabelas."
            />
            <FaqItem
              question="Funciona para qualquer impressora 3D?"
              answer="Sim. Temos perfis pré-configurados para toda a linha Bambu Lab (A1 Mini, A1, P1P, P1S, X1 Carbon, H2D) e também campo personalizado onde você digita o consumo em kWh de qualquer outra impressora."
            />
            <FaqItem
              question="Posso cancelar quando quiser?"
              answer="Sim, sem burocracia. Cancele direto pelo portal de assinatura com um clique. Não tem multa, fidelidade ou carência. No plano anual, você mantém o acesso até o final do período pago."
            />
            <FaqItem
              question="Como funcionam os 2 meses grátis no plano anual?"
              answer="No plano anual você paga R$290 por 12 meses de acesso — o equivalente a R$24,17/mês. Comparado com o mensal de R$29, é como ganhar 2 meses grátis. E com a promoção de lançamento, o desconto é de 58% sobre o preço original (R$696)."
            />
            <FaqItem
              question="Meus dados ficam seguros?"
              answer="Sim. Suas precificações e preferências são salvas com criptografia. O pagamento é processado de forma segura, nós nunca armazenamos dados do cartão. Toda comunicação usa HTTPS."
            />
            <FaqItem
              question="Funciona no celular?"
              answer="Sim. O 3DEcom é totalmente responsivo e funciona em qualquer dispositivo: computador, tablet ou celular. Acesse direto pelo navegador, sem instalar nada."
            />
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-[120px] px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(0,229,160,0.1),transparent_65%)] pointer-events-none" />
        <h2 className="relative z-10 text-[clamp(32px,6vw,64px)] font-extrabold tracking-[-2px] leading-[1.1] mb-[18px]">
          Chega de<br /><em className="not-italic text-[#00e5a0]">perder dinheiro</em><br />em cada venda
        </h2>
        <p className="relative z-10 font-mono text-sm text-[#b0b0cc] leading-[1.8] mb-10">
          Compre, use por 7 dias e, se não ficar satisfeito,<br />devolvemos 100% do seu dinheiro. Sem perguntas.
        </p>
        <a
          href="#precos"
          className="relative z-10 inline-flex bg-gradient-to-br from-[#00e5a0] to-[#00c87a] text-black font-extrabold text-lg px-11 py-5 rounded-[14px] tracking-[-0.3px] transition-all hover:-translate-y-[3px] hover:shadow-[0_20px_50px_rgba(0,229,160,0.3)]"
        >
          &#128640; Ver planos e assinar
        </a>
        <div className="relative z-10 flex items-center justify-center gap-5 font-mono text-[11px] text-[#555578] mt-6 flex-wrap">
          <span className="flex items-center gap-1">&#10003; Garantia de reembolso 7 dias</span>
          <span className="flex items-center gap-1">&#10003; Cancele quando quiser</span>
          <span className="flex items-center gap-1">&#10003; Taxas reais 2026</span>
          <span className="flex items-center gap-1">&#10003; Shopee + ML</span>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0a0a12] border-t border-[#1e1e30] py-10 px-6 text-center">
        <div className="text-xl font-extrabold tracking-tight mb-2">
          3D<span className="text-[#00e5a0]">Ecom</span>
        </div>
        <div className="font-mono text-[11px] text-[#555578] mb-5">
          Precificadora para impressão 3D &middot; Shopee & Mercado Livre
        </div>
        <div className="flex gap-5 justify-center flex-wrap mb-5">
          <a href="#funcoes" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">Funções</a>
          <a href="#taxas" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">Taxas</a>
          <a href="#precos" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">Preços</a>
          <a href="#faq" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">FAQ</a>
        </div>
        <div className="flex gap-5 justify-center flex-wrap mb-5">
          <Link href="/termos" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">Termos de Uso</Link>
          <Link href="/privacidade" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">Política de Privacidade</Link>
          <a href="mailto:suporte@precificadora3decom.com.br" className="font-mono text-[11px] text-[#555578] hover:text-[#b0b0cc] transition-colors">suporte@precificadora3decom.com.br</a>
        </div>
        <div className="font-mono text-[10px] text-[#2a2a40]">
          &copy; 2026 3DEcom. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
