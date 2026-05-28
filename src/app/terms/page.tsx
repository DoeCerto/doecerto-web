import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — DoeCerto",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#4a1d7a] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Termos de Uso</h1>
            <p className="text-purple-300 text-sm">Versão 1.1 — 27 de maio de 2026</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-purple-200 pl-4">
          Leia com atenção. Ao usar o DoeCerto, você concorda integralmente com estes Termos e com nossa{" "}
          <Link href="/privacidade" className="text-[#4a1d7a] font-bold underline">
            Política de Privacidade
          </Link>.
        </p>

        <Section numero="1" titulo="O que é o DoeCerto">
          <p>O DoeCerto (doecerto.net.br) é uma plataforma digital que conecta doadores a organizações sem fins lucrativos (ONGs) verificadas, facilitando doações financeiras e de materiais de forma transparente e segura.</p>
          <p>Estes Termos de Uso regulam o acesso e o uso da Plataforma. Ao acessar ou usar o DoeCerto — mesmo que parcialmente ou para testar — você declara ter lido, compreendido e concordado com estes Termos.</p>
          <p className="font-semibold">Se não concordar com alguma condição, não utilize a Plataforma.</p>
        </Section>

        <Section numero="2" titulo="Definições">
          <ul>
            <Li bold="Plataforma:">doecerto.net.br e todos os seus sistemas, aplicativos e APIs associados.</Li>
            <Li bold="Usuário:">qualquer pessoa que acessa ou usa a Plataforma — Doador, representante de ONG ou visitante.</Li>
            <Li bold="Doador:">pessoa física ou jurídica que realiza doações pela Plataforma.</Li>
            <Li bold="ONG:">organização da sociedade civil sem fins lucrativos verificada pelo DoeCerto.</Li>
            <Li bold="Doação:">transferência voluntária, gratuita e irrevogável de recursos de um Doador a uma ONG.</Li>
            <Li bold="Microdoação:">doação de valor unitário reduzido, processada com as condições tarifárias aplicáveis.</Li>
            <Li bold="Asaas:">Asaas Gestão Financeira Instituição de Pagamento S.A., parceiro de pagamentos do DoeCerto.</Li>
            <Li bold="Split de Pagamento:">modelo pelo qual o valor recebido é transferido automaticamente à ONG no momento da confirmação do pagamento.</Li>
            <Li bold="LGPD:">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).</Li>
          </ul>
        </Section>

        <Section numero="3" titulo="Quem pode usar o DoeCerto">
          <ul>
            <Li>Pessoas físicas maiores de 18 anos ou legalmente emancipadas;</Li>
            <Li>Pessoas jurídicas regularmente constituídas;</Li>
            <Li>Menores de 18 anos, somente com autorização expressa e supervisão de responsável legal.</Li>
          </ul>
          <p><span className="font-semibold">Declaração obrigatória:</span> ao criar uma conta, você declara, sob sua inteira responsabilidade, ser maior de 18 anos ou possuir autorização de responsável legal. O DoeCerto não realiza verificação ativa de idade.</p>
        </Section>

        <Section numero="4" titulo="Cadastro e conta">
          <SubSection titulo="4.1 Suas responsabilidades">
            <ul>
              <Li>Fornecer informações verdadeiras, completas e atualizadas;</Li>
              <Li>Guardar suas credenciais com sigilo — você é responsável por todo uso da sua conta;</Li>
              <Li>Nos avisar imediatamente em caso de acesso não autorizado: seguranca@doecerto.net.br.</Li>
            </ul>
            <p><span className="font-semibold">Cada Usuário pode ter apenas uma conta ativa.</span> Múltiplas contas são vedadas e sujeitas ao cancelamento.</p>
          </SubSection>
          <SubSection titulo="4.2 Suspensão ou encerramento">
            <p>O DoeCerto pode suspender ou encerrar contas a qualquer tempo nos seguintes casos:</p>
            <ul>
              <Li>Violação destes Termos ou da legislação aplicável;</Li>
              <Li>Fornecimento de informações falsas;</Li>
              <Li>Conduta fraudulenta, abusiva ou prejudicial;</Li>
              <Li>Inatividade superior a 24 meses;</Li>
              <Li>Determinação judicial ou regulatória.</Li>
            </ul>
          </SubSection>
        </Section>

        <Section numero="5" titulo="ONGs verificadas">
          <SubSection titulo="5.1 Como funciona a verificação">
            <p>Apenas ONGs aprovadas pelo processo de verificação podem ter perfil ativo. A verificação inclui:</p>
            <ul>
              <Li>Análise de documentação institucional (CNPJ, estatuto, ata de eleição);</Li>
              <Li>Comprovação de regularidade jurídica e fiscal;</Li>
              <Li>Verificação de ausência de restrições legais ou reputacionais.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="5.2 Limites da verificação">
            <p>A aprovação confirma que a ONG atendeu aos critérios do DoeCerto no momento da análise. <span className="font-semibold">Ela não representa garantia, endosso ou recomendação irrestrita das atividades da organização.</span></p>
            <p>O DoeCerto não se responsabiliza pela destinação final das doações, nem por irregularidades praticadas após a verificação.</p>
          </SubSection>
        </Section>

        <Section numero="6" titulo="O que você pode e não pode fazer">
          <SubSection titulo="6.1 Você se compromete a">
            <ul>
              <Li>Usar a Plataforma exclusivamente para as finalidades previstas nestes Termos;</Li>
              <Li>Respeitar os direitos dos outros Usuários, das ONGs e do DoeCerto;</Li>
              <Li>Comunicar qualquer irregularidade identificada.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="6.2 É expressamente proibido">
            <ul>
              <Li>Publicar conteúdo falso, ofensivo, discriminatório ou ilegal;</Li>
              <Li>Usar meios automatizados não autorizados para acessar ou coletar dados;</Li>
              <Li>Tentar acessar áreas restritas ou dados de outros Usuários;</Li>
              <Li>Criar múltiplas contas para contornar restrições;</Li>
              <Li>Praticar qualquer ato que comprometa a segurança ou reputação da Plataforma.</Li>
            </ul>
          </SubSection>
        </Section>

        <Section numero="7" titulo="Conteúdo e propriedade intelectual">
          <SubSection titulo="7.1 Propriedade do DoeCerto">
            <p>A marca DoeCerto, logotipo, design, interface e código-fonte são de propriedade exclusiva do DoeCerto, protegidos pelas leis de propriedade intelectual.</p>
          </SubSection>
          <SubSection titulo="7.2 Conteúdo publicado por você">
            <p>Você mantém a titularidade do conteúdo que publica, mas concede ao DoeCerto licença gratuita, não exclusiva e mundial para reproduzi-lo e exibi-lo exclusivamente para operação da Plataforma.</p>
          </SubSection>
        </Section>

        <Section numero="8" titulo="Integrações com terceiros">
          <SubSection titulo="8.1 Instagram (Meta Platforms)">
            <p>A Plataforma oferece integração opcional com o Instagram via API oficial da Meta. Ao habilitar:</p>
            <ul>
              <Li>A ONG autoriza o DoeCerto a exibir suas publicações no perfil;</Li>
              <Li>A ONG pode desativar a integração a qualquer momento.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="8.2 Outros serviços">
            <p>O DoeCerto não controla nem se responsabiliza pelo conteúdo ou práticas de serviços de terceiros.</p>
          </SubSection>
        </Section>

        <Section numero="9" titulo="Pagamentos e repasse de doações">
          <SubSection titulo="9.1 O DoeCerto não é instituição financeira">
            <p>O DoeCerto atua exclusivamente como intermediador tecnológico. Não captamos recursos em nome próprio nem realizamos atividades privativas de instituições financeiras.</p>
          </SubSection>
          <SubSection titulo="9.2 Parceiro de pagamentos — Asaas">
            <p>O processamento das transações é realizado pela Asaas, autorizada e regulamentada pelo Banco Central do Brasil. Ao realizar uma doação, seus dados de pagamento são processados diretamente pela Asaas.</p>
          </SubSection>
          <SubSection titulo="9.3 Como funciona o repasse">
            <ul>
              <Li>O Doador realiza o pagamento na Plataforma;</Li>
              <Li>A Asaas processa e confirma a transação;</Li>
              <Li>O sistema detecta a confirmação em tempo real via webhook;</Li>
              <Li>O repasse é enviado automaticamente à conta bancária da ONG;</Li>
              <Li>Ambas as partes recebem confirmação.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="9.4 Taxas">
            <p>As transações estão sujeitas a taxas definidas entre o DoeCerto e a Asaas, sempre informadas antes da conclusão de cada doação. O DoeCerto busca modelo percentual adequado ao volume de microdoações.</p>
          </SubSection>
          <SubSection titulo="9.5 Previsão de implementação">
            <p>A funcionalidade de pagamentos está em desenvolvimento e será disponibilizada em versão futura.</p>
          </SubSection>
        </Section>

        <Section numero="10" titulo="Responsabilidades">
          <SubSection titulo="10.1 O que o DoeCerto garante">
            <ul>
              <Li>Manter a Plataforma disponível e funcional, salvo manutenções ou força maior;</Li>
              <Li>Aplicar medidas de segurança adequadas;</Li>
              <Li>Atender solicitações de dados conforme a LGPD;</Li>
              <Li>Notificar Usuários sobre alterações relevantes.</Li>
            </ul>
          </SubSection>
          <SubSection titulo="10.2 Limitação de responsabilidade">
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 uppercase tracking-wide">
              Na máxima extensão permitida pela lei, o DoeCerto não se responsabiliza por danos indiretos, atos de ONGs ou terceiros, falhas da Asaas ou interrupções por ataques cibernéticos.
            </div>
          </SubSection>
        </Section>

        <Section numero="11" titulo="Modificações nos Termos">
          <ul>
            <Li>Você será notificado por e-mail com antecedência mínima de 15 dias;</Li>
            <Li>Alterações exigidas por lei produzem efeitos imediatos;</Li>
            <Li>O uso continuado após a vigência implica aceite.</Li>
          </ul>
        </Section>

        <Section numero="12" titulo="Disposições finais">
          <SubSection titulo="12.1 Lei aplicável">
            <p>Estes Termos são regidos pela legislação brasileira — Código Civil, CDC, Marco Civil da Internet e LGPD.</p>
          </SubSection>
          <SubSection titulo="12.2 Foro">
            <p>Foro da Comarca de Recife/PE, com renúncia a qualquer outro, salvo disposição legal em contrário.</p>
          </SubSection>
          <SubSection titulo="12.3 Contato">
            <ul>
              <Li>Geral: contato@doecerto.net.br</Li>
              <Li>Privacidade: privacidade@doecerto.net.br</Li>
              <Li>Segurança: seguranca@doecerto.net.br</Li>
            </ul>
          </SubSection>
        </Section>

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
          © {new Date().getFullYear()} DoeCerto — doecerto.net.br | Termos de Uso v1.1 — 27 de maio de 2026
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