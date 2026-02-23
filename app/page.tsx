import Link from 'next/link'
import {
  Calculator,
  ShoppingCart,
  Package,
  History,
  Check,
  ArrowRight,
  AlertTriangle,
  Clock,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const painPoints = [
  {
    number: '01',
    title: 'Preco no achismo',
    description: 'Sem dados, voce perde margem ou perde venda.',
    icon: HelpCircle,
  },
  {
    number: '02',
    title: 'Taxas esquecidas',
    description: 'Marketplace cobra 16-20%. Voce lembra de incluir?',
    icon: AlertTriangle,
  },
  {
    number: '03',
    title: 'Tempo perdido',
    description: 'Calcular na planilha toda vez e lento e propenso a erro.',
    icon: Clock,
  },
]

const features = [
  {
    title: 'Calculo em tempo real',
    description: 'Veja o preco atualizar enquanto ajusta os parametros.',
    icon: Calculator,
    featured: true,
  },
  {
    title: 'Multi-marketplace',
    description: 'Compare precos para ML, Shopee e venda direta.',
    icon: ShoppingCart,
    featured: false,
  },
  {
    title: 'Gestao de materiais',
    description: 'Cadastre PLA, ABS, PETG e tenha os custos sempre a mao.',
    icon: Package,
    featured: false,
  },
  {
    title: 'Historico completo',
    description: 'Salve e consulte todos os seus orcamentos.',
    icon: History,
    featured: false,
  },
]

const planFeatures = [
  'Calculadora ilimitada',
  'Gestao de materiais',
  'Gestao de maquinas',
  'Historico de calculos',
  'Suporte por email',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-[#ededf8]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-[#a0a0c0] hover:text-white" asChild>
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button className="bg-[#00e5a0] text-[#080810] hover:bg-[#00e5a0]/90 font-semibold" asChild>
              <Link href="/auth/cadastro">Comecar</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,229,160,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 40% 40% at 80% 70%, rgba(0,229,160,0.03) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#252538] bg-[#13131f]/80 px-4 py-1.5 text-sm text-[#a0a0c0]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00e5a0] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00e5a0]" />
            </span>
            Precificacao inteligente para impressao 3D
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Pare de{' '}
            <span className="relative inline-block text-[#a0a0c0]">
              <span className="relative">
                chutar preco
                <span className="absolute left-0 top-1/2 h-[2px] w-full bg-red-500/70" />
              </span>
            </span>
            .
            <br />
            Precifique certo.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#a0a0c0] leading-relaxed">
            Calculadora profissional que considera material, energia, maquina,
            mao de obra e taxas de marketplace. Nunca mais perca dinheiro.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#00e5a0] text-[#080810] hover:bg-[#00e5a0]/90 font-semibold h-12 px-8 text-base"
              asChild
            >
              <Link href="/auth/cadastro">
                Comecar agora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#252538] text-[#ededf8] hover:bg-[#13131f] h-12 px-8 text-base"
              asChild
            >
              <a href="#funcionalidades">Ver funcionalidades</a>
            </Button>
          </div>

          {/* Social proof */}
          <p className="mt-6 text-sm text-[#a0a0c0]">
            Usado por <span className="font-semibold text-[#ededf8]">+200</span> impressores 3D
          </p>

          {/* Mockup card */}
          <div className="mx-auto mt-12 max-w-sm">
            <div className="rounded-2xl border border-[#252538] bg-[#13131f]/80 shadow-2xl shadow-[#00e5a0]/5 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-[#252538] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-[#252538]" />
                  <div className="size-2.5 rounded-full bg-[#252538]" />
                  <div className="size-2.5 rounded-full bg-[#252538]" />
                </div>
                <div className="mx-auto rounded-md bg-[#0e0e1a] px-8 py-1 text-xs text-[#a0a0c0] font-mono">
                  3decom.com.br
                </div>
              </div>
              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a0a0c0]">Material</span>
                  <span className="font-mono text-[#ededf8]">R$ 12,40</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a0a0c0]">Energia</span>
                  <span className="font-mono text-[#ededf8]">R$ 0,85</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a0a0c0]">Mao de obra</span>
                  <span className="font-mono text-[#ededf8]">R$ 5,00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a0a0c0]">Margem (40%)</span>
                  <span className="font-mono text-[#ededf8]">R$ 11,63</span>
                </div>
                <div className="border-t border-[#252538] pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">TOTAL</span>
                  <span className="font-mono text-xl font-bold text-[#00e5a0]">
                    R$ 40,46
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="relative py-24 px-6" style={{ backgroundColor: '#0a0a12' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Voce esta perdendo dinheiro?
            </h2>
            <p className="mt-4 text-[#a0a0c0] max-w-xl mx-auto">
              A maioria dos impressores 3D enfrenta esses problemas diariamente.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {painPoints.map((point) => (
              <div
                key={point.number}
                className="group rounded-2xl border border-[#252538] bg-[#13131f]/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00e5a0]/30"
              >
                <span className="inline-flex items-center justify-center size-8 rounded-lg bg-[#00e5a0]/10 text-[#00e5a0] text-xs font-bold font-mono mb-4">
                  {point.number}
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <point.icon className="size-4 text-[#a0a0c0]" />
                  <h3 className="text-lg font-semibold">{point.title}</h3>
                </div>
                <p className="text-sm text-[#a0a0c0] leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="relative py-24 px-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(0,229,160,0.03) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Tudo que voce precisa
            </h2>
            <p className="mt-4 text-[#a0a0c0] max-w-xl mx-auto">
              Ferramentas profissionais para precificar suas pecas com precisao.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  feature.featured
                    ? 'border-[#00e5a0]/30 bg-[#13131f]/80 shadow-lg shadow-[#00e5a0]/5'
                    : 'border-[#252538] bg-[#13131f]/80 hover:border-[#00e5a0]/30'
                }`}
              >
                <div className="flex items-center justify-center size-11 rounded-lg bg-[#00e5a0]/10 mb-4">
                  <feature.icon className="size-5 text-[#00e5a0]" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-[#a0a0c0] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 px-6" style={{ backgroundColor: '#0a0a12' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Simples e acessivel
            </h2>
            <p className="mt-4 text-[#a0a0c0] max-w-xl mx-auto">
              Um unico plano com tudo incluso. Sem surpresas.
            </p>
          </div>

          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-[#00e5a0]/30 bg-[#13131f]/80 p-8 shadow-lg shadow-[#00e5a0]/5">
              <div className="text-center">
                <span className="inline-flex items-center rounded-full bg-[#00e5a0]/10 px-3 py-1 text-xs font-semibold text-[#00e5a0] mb-4">
                  Plano Unico
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">R$ 29</span>
                  <span className="text-[#a0a0c0] text-sm">/mes</span>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center size-5 rounded-full bg-[#00e5a0]/10">
                      <Check className="size-3 text-[#00e5a0]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full bg-[#00e5a0] text-[#080810] hover:bg-[#00e5a0]/90 font-semibold h-12 text-base"
                asChild
              >
                <Link href="/auth/cadastro">
                  Comecar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#252538] py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">3D</span>
            <span className="text-[#00e5a0]">Ecom</span>
          </Link>
          <p className="text-sm text-[#a0a0c0]">
            &copy; 2026 3DEcom. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
