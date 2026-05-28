import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — DoeCerto",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#4a1d7a] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Política de Privacidade</h1>
            <p className="text-purple-300 text-sm">Versão 1.1 — 27 de maio de 2026</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <p className="text-gray-600 text-base leading-relaxed border-l-4 border-purple-200 pl-4">
          Esta Política explica como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018).
        </p>

        <Section numero="1" titulo="Quem controla seus dados">
          <p>O controlador dos dados é a equipe operadora do DoeCerto (doecerto.net.br), com sede no Brasil.</p>
          <ul>
            <Li bold="E-mail de privacidade:">privacidade@doecerto.net.br</Li>
            <Li bold="Prazo de resposta:">até 15 dias úteis</Li>
          </ul>
        </Section>

        <Section numero="2" titulo="Quais dados coletamos">
          <SubSection titulo="2.1 Dados fornecidos por Doadores">
            <ul>
              <Li>Nome completo e e-mail;</Li>
              <Li>Telefone (opcional);</Li>
              <Li>Cidade e estado de residência;</Li>
              <Li>Histórico de doações.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="2.2 Dados fornecidos por ONGs">
            <ul>
              <Li>Razão social, nome fantasia e CNPJ;</Li>
              <Li>Nome, CPF e dados de contato do representante legal;</Li>
              <Li>Documentação institucional;</Li>
              <Li>Dados bancários para recebimento de repasses;</Li>
              <Li>Token de acesso à API do Instagram (quando habilitado).</Li>
            </ul>
          </SubSection>
          <SubSection titulo="2.3 Dados de pagamento">
            <p><span className="font-semibold">Importante:</span> dados sensíveis de pagamento são processados diretamente pela Asaas. O DoeCerto não armazena, visualiza nem processa esses dados.</p>
            <p>O DoeCerto armazena apenas:</p>
            <ul>
              <Li>Valor, data e método de pagamento (sem dados sensíveis);</Li>
              <Li>Identificador e status da transação;</Li>
              <Li>Dados bancários das ONGs para os repasses automáticos.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="2.4 Dados coletados automaticamente">
            <ul>
              <Li>Endereço IP e geolocalização aproximada;</Li>
              <Li>Dispositivo, navegador e sistema operacional;</Li>
              <Li>Páginas visitadas e tempo de sessão;</Li>
              <Li>Dados de cookies.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="2.5 Dados do Instagram">
            <p>Quando a ONG habilita a integração:</p>
            <ul>
              <Li>Identificador único do Instagram;</Li>
              <Li>Publicações, legendas, datas e URLs;</Li>
              <Li>Token de acesso — armazenado de forma criptografada.</Li>
            </ul>
            <p className="text-sm text-gray-500 italic">O DoeCerto não armazena arquivos de imagem ou vídeo — apenas referencia URLs da API da Meta.</p>
          </SubSection>
        </Section>

        <Section numero="3" titulo="Para que usamos seus dados">
          <ul>
            <Li>Criar e gerenciar contas de Usuários e ONGs;</Li>
            <Li>Processar doações e operar o modelo de split de pagamento;</Li>
            <Li>Verificar a idoneidade de ONGs;</Li>
            <Li>Exibir publicações do Instagram no perfil da ONG;</Li>
            <Li>Enviar confirmações, notificações e comunicados de segurança;</Li>
            <Li>Melhorar a Plataforma com base em dados de navegação;</Li>
            <Li>Enviar marketing, mediante consentimento prévio;</Li>
            <Li>Cumprir obrigações legais e regulatórias.</Li>
          </ul>
        </Section>

        <Section numero="4" titulo="Base legal para o tratamento (LGPD)">
          <ul>
            <Li bold="Execução de contrato (art. 7º, V):">uso da Plataforma, processamento de doações e verificação de ONGs.</Li>
            <Li bold="Legítimo interesse (art. 7º, IX):">análise de navegação, prevenção de fraudes e segurança.</Li>
            <Li bold="Consentimento (art. 7º, I):">marketing, integração com Instagram e cookies não essenciais.</Li>
            <Li bold="Obrigação legal (art. 7º, II):">retenção exigida por lei, atendimento a autoridades.</Li>
            <Li bold="Exercício de direitos (art. 7º, VI):">uso em processos judiciais.</Li>
          </ul>
        </Section>

        <Section numero="5" titulo="Com quem compartilhamos seus dados">
          <p className="font-semibold">Não vendemos, alugamos nem comercializamos seus dados.</p>
          <p>Compartilhamos apenas nas seguintes situações:</p>
          <ul>
            <Li bold="Asaas:">processamento de pagamentos e operação do split.</Li>
            <Li bold="Meta (Instagram):">tokens de acesso para comunicação com a API.</Li>
            <Li bold="Prestadores de serviço:">hospedagem, e-mail e analytics, sob obrigações de confidencialidade.</Li>
            <Li bold="Autoridades:">quando exigido por lei ou ordem judicial.</Li>
            <Li bold="Reorganização societária:">fusão ou venda de ativos — o sucessor fica vinculado a esta Política.</Li>
          </ul>
        </Section>

        <Section numero="6" titulo="Por quanto tempo guardamos seus dados">
          <ul>
            <Li>Dados de conta ativa: enquanto a conta estiver ativa;</Li>
            <Li>Dados de doações: até 5 anos após encerramento;</Li>
            <Li>Dados bancários das ONGs: excluídos após encerramento do cadastro;</Li>
            <Li>Logs de navegação: até 6 meses (Marco Civil da Internet);</Li>
            <Li>Tokens do Instagram: excluídos imediatamente após desconexão.</Li>
          </ul>
        </Section>

        <Section numero="7" titulo="Cookies">
          <ul>
            <Li bold="Necessários:">essenciais para login e funcionamento básico. Não podem ser desativados.</Li>
            <Li bold="Analíticos:">dados de navegação para melhorar a Plataforma. Sujeitos a consentimento.</Li>
            <Li bold="Funcionais:">armazenam preferências. Sujeitos a consentimento.</Li>
          </ul>
        </Section>

        <Section numero="8" titulo="Como protegemos seus dados">
          <ul>
            <Li>Criptografia em trânsito (TLS) e em repouso;</Li>
            <Li>Armazenamento seguro de tokens e credenciais;</Li>
            <Li>Controle de acesso baseado em funções (RBAC);</Li>
            <Li>Monitoramento contínuo e alertas de anomalias;</Li>
            <Li>Plano de resposta a incidentes com notificação à ANPD (art. 48 da LGPD).</Li>
          </ul>
        </Section>

        <Section numero="9" titulo="Seus direitos (LGPD)">
          <p>Escreva para <span className="font-bold text-[#4a1d7a]">privacidade@doecerto.net.br</span> para exercer seus direitos:</p>
          <ul>
            <Li bold="I. Confirmação:">saber se tratamos dados seus.</Li>
            <Li bold="II. Acesso:">obter cópia dos dados que temos sobre você.</Li>
            <Li bold="III. Correção:">corrigir dados incompletos ou inexatos.</Li>
            <Li bold="IV. Eliminação:">de dados desnecessários ou tratados irregularmente.</Li>
            <Li bold="V. Portabilidade:">receber seus dados em formato interoperável.</Li>
            <Li bold="VI. Revogação:">retirar consentimento a qualquer tempo.</Li>
            <Li bold="VII. Informação:">saber com quem compartilhamos seus dados.</Li>
            <Li bold="VIII. Oposição:">opor-se a tratamentos nos casos previstos em lei.</Li>
            <Li bold="IX. Revisão automatizada:">revisão de decisões tomadas por sistemas automatizados.</Li>
          </ul>
          <p className="text-sm text-gray-500">Respondemos em até 15 dias úteis. O exercício é gratuito.</p>
        </Section>

        <Section numero="10" titulo="Transferência internacional">
          <p>Seus dados podem ser processados fora do Brasil (nuvem, API da Meta, Asaas). Garantimos conformidade com a LGPD, incluindo cláusulas contratuais-padrão com os destinatários.</p>
        </Section>

        <Section numero="11" titulo="Crianças e adolescentes">
          <p>O DoeCerto não se destina a menores de 13 anos. Ao criar uma conta, o Usuário declara ser maior de 18 anos ou possuir autorização de responsável legal.</p>
          <p>Se tomarmos conhecimento de dados de menor de 13 anos sem consentimento do responsável, excluiremos imediatamente (art. 14 da LGPD).</p>
        </Section>

        <Section numero="12" titulo="Atualizações desta Política">
          <ul>
            <Li>Você será notificado por e-mail com antecedência mínima de 15 dias;</Li>
            <Li>O uso continuado implica aceite das novas condições.</Li>
          </ul>
        </Section>

        <Section numero="13" titulo="Contato">
          <ul>
            <Li bold="Privacidade:">privacidade@doecerto.net.br</Li>
            <Li bold="Geral:">contato@doecerto.net.br</Li>
            <Li bold="ANPD (reclamações):">gov.br/anpd</Li>
          </ul>
        </Section>

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
          © {new Date().getFullYear()} DoeCerto — doecerto.net.br | Política de Privacidade v1.1 — 27 de maio de 2026
        </p>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Section({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[#4a1d7a] border-b border-purple-100 pb-2">
        {numero}. {titulo.toUpperCase()}
      </h2>
      <div className="space-y-3 text-gray-700 text-lg leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubSection({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-gray-800 text-lg">{titulo}</h3>
      <div className="space-y-2 text-gray-700">{children}</div>
    </div>
  );
}

function Li({ children, bold }: { children: React.ReactNode; bold?: string }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="text-purple-400 mt-1 flex-shrink-0">–</span>
      <span>{bold && <span className="font-bold">{bold} </span>}{children}</span>
    </li>
  );
}