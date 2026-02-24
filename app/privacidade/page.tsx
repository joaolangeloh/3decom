import Link from 'next/link'

export const metadata = { title: 'Política de Privacidade' }

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="font-mono text-xs text-[#555578] mb-10">
          Última atualização: 23 de fevereiro de 2026
        </p>

        <div className="space-y-8 text-sm leading-[1.8] text-[#b0b0cc]">
          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              1. Introdução
            </h2>
            <p>
              O 3DEcom (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo;) respeita a
              privacidade dos seus usuários. Esta Política de Privacidade
              explica como coletamos, usamos, armazenamos e protegemos seus
              dados pessoais ao utilizar a plataforma
              precificadora3decom.com.br.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              2. Dados Coletados
            </h2>
            <p>Coletamos os seguintes dados:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong className="text-[#ededf8]">Dados de cadastro:</strong>{' '}
                nome, email e senha (criptografada)
              </li>
              <li>
                <strong className="text-[#ededf8]">Dados de uso:</strong>{' '}
                cálculos de precificação salvos, preferências configuradas e
                histórico de uso
              </li>
              <li>
                <strong className="text-[#ededf8]">Dados técnicos:</strong>{' '}
                endereço IP, tipo de navegador e dados de acesso para fins de
                segurança e análise
              </li>
              <li>
                <strong className="text-[#ededf8]">Dados de pagamento:</strong>{' '}
                processados exclusivamente pela Lastlink — não armazenamos
                dados de cartão de crédito
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              3. Uso dos Dados
            </h2>
            <p>Seus dados são utilizados para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Fornecer e manter o serviço de precificação</li>
              <li>Autenticar seu acesso à plataforma</li>
              <li>Salvar seus cálculos e preferências</li>
              <li>Processar e gerenciar sua assinatura</li>
              <li>Enviar comunicações sobre o serviço (atualizações, suporte)</li>
              <li>Melhorar a plataforma com base em dados de uso agregados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              4. Armazenamento e Segurança
            </h2>
            <p>
              Seus dados são armazenados em servidores seguros fornecidos pelo
              Supabase, com criptografia em trânsito (TLS) e em repouso.
              Senhas são armazenadas usando hash criptográfico (bcrypt) e nunca
              são acessíveis em texto plano. Implementamos controle de acesso
              por Row Level Security (RLS) para garantir que cada usuário
              acesse apenas seus próprios dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              5. Compartilhamento de Dados
            </h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com
              terceiros para fins de marketing. Seus dados podem ser
              compartilhados apenas com:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong className="text-[#ededf8]">Lastlink:</strong>{' '}
                processamento de pagamentos e gestão de assinaturas
              </li>
              <li>
                <strong className="text-[#ededf8]">Supabase:</strong>{' '}
                infraestrutura de banco de dados e autenticação
              </li>
              <li>
                <strong className="text-[#ededf8]">Vercel:</strong>{' '}
                hospedagem da aplicação e analytics de uso
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              6. Cookies e Tecnologias Similares
            </h2>
            <p>
              Utilizamos cookies essenciais para autenticação e manutenção da
              sessão do usuário. Não utilizamos cookies de rastreamento de
              terceiros para publicidade. Os dados de preferências são
              armazenados localmente no navegador (localStorage) e não são
              enviados para nossos servidores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              7. Seus Direitos (LGPD)
            </h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você
              tem direito a:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Acessar seus dados pessoais armazenados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento para uso dos dados</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Obter informações sobre o compartilhamento dos dados</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer desses direitos, entre em contato pelo
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

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              8. Retenção de Dados
            </h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Após o
              cancelamento da assinatura, seus dados de cálculos e preferências
              são mantidos por 90 dias para o caso de reativação. Após esse
              período, são excluídos permanentemente. Você pode solicitar a
              exclusão imediata a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              9. Menores de Idade
            </h2>
            <p>
              O 3DEcom não é destinado a menores de 18 anos. Não coletamos
              intencionalmente dados de menores. Caso identifiquemos que dados
              de um menor foram coletados, eles serão excluídos imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              10. Alterações nesta Política
            </h2>
            <p>
              Esta política pode ser atualizada periodicamente. Alterações
              significativas serão comunicadas por email. A data da última
              atualização é exibida no topo desta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ededf8] mb-3">
              11. Contato
            </h2>
            <p>
              Para dúvidas, solicitações ou reclamações sobre privacidade, entre
              em contato pelo email{' '}
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
            href="/termos"
            className="hover:text-[#b0b0cc] transition-colors"
          >
            Termos de Uso
          </Link>
        </div>
      </div>
    </div>
  )
}
