import Link from 'next/link'

export const metadata = { title: 'Termos de Uso' }

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-[#ededf8]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block mb-10 text-xl font-extrabold tracking-tight"
        >
          3D<span className="text-[#00e5a0]">Ecom</span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Termos de Uso
        </h1>
        <p className="font-mono text-xs text-[#555578] mb-10">
          Última atualização: 23 de fevereiro de 2026
        </p>

        <div className="space-y-8 text-sm leading-[1.8] text-[#b0b0cc]">
          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar ou utilizar a plataforma 3DEcom
              (&ldquo;precificadora3decom.com.br&rdquo;), você concorda em
              cumprir e estar vinculado a estes Termos de Uso. Caso não
              concorde, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              2. Descrição do Serviço
            </h2>
            <p>
              O 3DEcom é uma ferramenta SaaS de precificação voltada para
              vendedores de impressão 3D. A plataforma oferece calculadora de
              preços com taxas reais de marketplaces (Shopee e Mercado Livre),
              histórico de cálculos e preferências personalizáveis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              3. Cadastro e Conta
            </h2>
            <p>
              Para utilizar o serviço, você deve criar uma conta fornecendo
              informações verdadeiras e completas. Você é responsável por manter
              a confidencialidade de sua senha e por todas as atividades que
              ocorram em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              4. Assinatura e Pagamento
            </h2>
            <p>
              O acesso à plataforma requer uma assinatura paga, processada pela
              Lastlink. Os planos disponíveis são mensal (R$29/mês) e anual
              (R$290/ano). Os preços podem ser alterados mediante aviso prévio
              de 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              5. Garantia e Reembolso
            </h2>
            <p>
              Oferecemos garantia de 7 dias. Se você não ficar satisfeito com o
              serviço dentro dos primeiros 7 dias após a contratação, poderá
              solicitar o reembolso integral sem necessidade de justificativa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              6. Cancelamento
            </h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento enviando
              um email para{' '}
              <a
                href="mailto:suporte@precificadora3decom.com.br"
                className="text-[#00e5a0] hover:underline"
              >
                suporte@precificadora3decom.com.br
              </a>
              . Não há multa, fidelidade ou carência. No plano anual, o acesso
              é mantido até o final do período pago.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              7. Uso Adequado
            </h2>
            <p>Ao utilizar o 3DEcom, você concorda em:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Não compartilhar sua conta ou credenciais com terceiros
              </li>
              <li>
                Não tentar acessar áreas restritas da plataforma de forma não
                autorizada
              </li>
              <li>
                Não utilizar a plataforma para fins ilegais ou não autorizados
              </li>
              <li>
                Não reproduzir, distribuir ou revender os cálculos ou dados da
                plataforma de forma comercial
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              8. Isenção de Responsabilidade
            </h2>
            <p>
              As taxas de marketplace e os cálculos apresentados pela plataforma
              são baseados em informações públicas e podem sofrer alterações sem
              aviso prévio por parte dos marketplaces. O 3DEcom se esforça para
              manter os dados atualizados, mas não garante a exatidão absoluta
              dos valores. O usuário é responsável por conferir as taxas vigentes
              antes de tomar decisões de precificação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              9. Propriedade Intelectual
            </h2>
            <p>
              Todo o conteúdo da plataforma, incluindo código, design, textos e
              marca, é propriedade do 3DEcom e protegido por leis de propriedade
              intelectual. É proibida a reprodução sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              10. Alterações nos Termos
            </h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento.
              Alterações significativas serão comunicadas por email. O uso
              continuado da plataforma após a notificação constitui aceitação dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              11. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre estes termos, entre em contato pelo
              email{' '}
              <a
                href="mailto:suporte@precificadora3decom.com.br"
                className="text-[#00e5a0] hover:underline"
              >
                suporte@precificadora3decom.com.br
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#1e1e30] flex gap-5 font-mono text-[11px] text-[#555578]">
          <Link href="/" className="hover:text-[#b0b0cc] transition-colors">
            Voltar ao início
          </Link>
          <Link
            href="/privacidade"
            className="hover:text-[#b0b0cc] transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
