import Link from "next/link";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ShieldCheck,
  Scale,
  Wallet,
  Building2,
  Lock,
  FileCheck2,
  AlertTriangle,
  HeartHandshake,
  Package,
  CheckCircle2,
  ExternalLink,
  Landmark,
  BadgeCheck,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Termos e Condições de Uso",
  description:
    "Termos e Condições Gerais de Uso da plataforma DoeCerto (v5.0), operada pela InovaLabs Inova Simples (I.S.). Regras de intermediação tecnológica, Pix Dinâmico via Asaas, compliance CGU e responsabilidades.",
};

const TOC_ITEMS = [
  { id: "secao-1", num: "01", label: "Identificação e Aceite" },
  { id: "secao-2", num: "02", label: "Definições Técnicas" },
  { id: "secao-3", num: "03", label: "Elegibilidade, Conta e 2FA" },
  { id: "secao-4", num: "04", label: "Natureza Jurídica (Zero Custódia)" },
  { id: "secao-5", num: "05", label: "Pagamentos, Pix e Microdoações" },
  { id: "secao-6", num: "06", label: "Gorjeta Voluntária e Split Nativo" },
  { id: "secao-7", num: "07", label: "Repasses, Trava de 48h e MED" },
  { id: "secao-8", num: "08", label: "Irrevogabilidade e Questões Fiscais" },
  { id: "secao-9", num: "09", label: "Doação como Visitante (Guest)" },
  { id: "secao-10", num: "10", label: "Doações de Materiais (Wishlist)" },
  { id: "secao-11", num: "11", label: "Compliance CGU e Limites do Selo" },
  { id: "secao-12", num: "12", label: "Obrigações e Condutas Vedadas" },
  { id: "secao-13", num: "13", label: "Propriedade Intelectual (INPI)" },
  { id: "secao-14", num: "14", label: "Limitação de Responsabilidade e Foro" },
];

export default function TermosPage() {
  return (
    <div className={`min-h-screen bg-white text-slate-900 selection:bg-[#6B39A7] selection:text-white ${poppins.className}`}>
      {/* NAVBAR STICKY NO PADRÃO DOECERTO TECH */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar ao início</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <Link href="/" className="flex items-center">
              <img src="/logo-roxa.svg" alt="DoeCerto" className="h-6 object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
              <span className="px-4 py-1.5 rounded-full bg-white text-[#6B39A7] font-bold text-xs shadow-2xs">
                Termos de Uso
              </span>
              <Link
                href="/privacy"
                className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
              >
                Privacidade & LGPD
              </Link>
              <Link
                href="/metodologia"
                className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
              >
                Metodologia
              </Link>
            </div>

            <Link
              href="/home"
              className="px-5 py-2.5 rounded-full bg-[#6B39A7] hover:bg-[#582C8C] text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-xs"
            >
              Explorar ONGs
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION DOECERTO TECH */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-slate-100 bg-gradient-to-b from-purple-50/40 via-white to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-100/80 text-[#6B39A7] border border-purple-200/60">
              <Scale size={14} />
              Versão 5.0 • Vigência: Novembro de 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
              INPI: BR512026005500-8
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck size={14} />
              Conformidade BACEN, CGU & LGPD
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-5 max-w-4xl">
            Termos e Condições Gerais de Uso
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mb-12">
            Este instrumento regula juridicamente o acesso e a utilização da plataforma{" "}
            <strong className="text-slate-900 font-semibold">DoeCerto</strong>, operada pela{" "}
            <strong className="text-slate-900 font-semibold">INOVALABS INOVA SIMPLES (I.S.)</strong>{" "}
            (CNPJ nº <span className="font-mono text-sm">68.163.255/0001-09</span>). Leia atentamente
            cada cláusula antes de realizar doações, cadastrar uma organização ou utilizar nossos serviços.
          </p>

          {/* 4 CARDS DE RESUMO EXECUTIVO (LINGUAGEM CLARA / LEGAL DESIGN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <Landmark size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  1. Zero Custódia Financeira
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O DoeCerto não é banco nem retém o dinheiro das doações. Cobranças de Pix Dinâmico são emitidas diretamente na subconta individual da ONG junto à Asaas I.P. (BACEN nº 461).
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Cláusulas 04 e 05
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <HeartHandshake size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  2. Gorjeta Opcional & Taxas
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comissão obrigatória de 0% para ONGs. No Pix Dinâmico incide apenas a taxa da liquidante (~R$ 0,99). O apoio financeiro ao DoeCerto é 100% voluntário e separado na fonte via Split.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Cláusulas 06 e 07
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  3. Limites da Verificação
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Auditamos CNPJ e CPF de dirigentes nas bases da Receita Federal e CGU (CEIS, CNEP, CEPIM e CEAF). Trata-se de diligência de meio, não de fiança ou garantia sobre a gestão futura da ONG.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Cláusula 11
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <Package size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  4. Irrevogabilidade & Itens
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Doações liquidadas são liberalidades irrevogáveis (Código Civil, art. 538). Nas doações de materiais físicos, a entrega e a logística são combinadas diretamente entre Doador e ONG.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Cláusulas 08 e 10
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL EM 2 COLUNAS (SIDEBAR STICKY + CLÁUSULAS) */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: ÍNDICE NAVEGÁVEL + FICHA INSTITUCIONAL */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/70">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Índice de Cláusulas
                </span>
                <span className="text-xs font-mono font-bold text-[#6B39A7]">14 seções</span>
              </div>
              <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {TOC_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#6B39A7] hover:bg-purple-50/70 transition-colors group"
                  >
                    <span className="font-mono font-bold text-slate-400 group-hover:text-[#6B39A7] transition-colors">
                      {item.num}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* QUADRO INSTITUCIONAL DA OPERADORA */}
            <div className="p-6 rounded-3xl bg-[#4A2675] text-white space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-purple-200" />
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-purple-200 font-semibold">
                    Entidade Operadora
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    INOVALABS INOVA SIMPLES (I.S.)
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-purple-100/90 border-t border-white/15 pt-3 font-normal">
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">CNPJ:</span>
                  <span className="font-mono font-semibold text-white">68.163.255/0001-09</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">Registro INPI:</span>
                  <span className="font-mono font-semibold text-white">BR512026005500-8</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">Titularidade IP:</span>
                  <span className="font-semibold text-white text-right">IFPE (Licenciado via NIT)</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">Sede:</span>
                  <span className="font-semibold text-white text-right">Igarassu / Recife — PE</span>
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/privacy"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Lock size={14} />
                  <span>Ler Política de Privacidade (LGPD)</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* COLUNA DIREITA: CLÁUSULAS CONTRATUAIS COMPLETAS */}
          <div className="lg:col-span-8 space-y-8">
            {/* AVISO PRELIMINAR VINCULANTE */}
            <div className="p-6 sm:p-7 rounded-3xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#6B39A7] text-white flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 size={20} />
              </div>
              <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 text-base">
                  Declaração de Ciência e Aceite Eletrônico Vinculante
                </p>
                <p>
                  Ao navegar, criar conta, cadastrar uma Organização da Sociedade Civil (ONG), efetuar doações como usuário autenticado ou visitante (<em>Guest Checkout</em>) na plataforma{" "}
                  <strong>DoeCerto</strong>, você manifesta sua concordância livre, expressa, informada e sem reservas com a integralidade destes Termos de Uso e com a nossa{" "}
                  <Link href="/privacy" className="text-[#6B39A7] font-bold underline hover:text-[#4A2675]">
                    Política de Privacidade e Proteção de Dados Pessoais
                  </Link>
                  , celebrando contrato eletrônico juridicamente válido nos termos dos artigos 104, 107 e 425 do Código Civil Brasileiro (Lei nº 10.406/2002) e do Marco Civil da Internet (Lei nº 12.965/2014).{" "}
                  <strong>Caso não concorde com qualquer disposição deste instrumento, abstenha-se imediatamente de utilizar a Plataforma.</strong>
                </p>
              </div>
            </div>

            {/* SEÇÃO 1 */}
            <ClauseCard id="secao-1" num="01" title="Identificação da Operadora, Titularidade e Objeto">
              <SubClause title="1.1. Operação e Personalidade Jurídica">
                <p>
                  A plataforma digital <strong>DoeCerto</strong> (acessível pelo domínio oficial{" "}
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">doecerto.net.br</span> e suas respectivas APIs e subdomínios) é mantida, administrada e operada comercial e tecnologicamente pela{" "}
                  <strong>INOVALABS INOVA SIMPLES (I.S.)</strong>, pessoa jurídica de direito privado constituída sob o regime da Lei Complementar nº 167/2019 (Marco Legal das Startups — Lei Complementar nº 182/2021), inscrita no CNPJ sob o nº{" "}
                  <strong>68.163.255/0001-09</strong>, com sede no Município de Igarassu, Estado de Pernambuco, doravante denominada simplesmente <strong>&ldquo;Operadora&rdquo;</strong> ou <strong>&ldquo;DoeCerto&rdquo;</strong>.
                </p>
              </SubClause>
              <SubClause title="1.2. Origem Acadêmica e Registro no INPI">
                <p>
                  O programa de computador que compõe o núcleo tecnológico do DoeCerto possui Certificado de Registro de Programa de Computador expedido pelo Instituto Nacional da Propriedade Industrial (INPI) sob o processo nº{" "}
                  <strong>BR512026005500-8</strong>, de titularidade originária do{" "}
                  <strong>Instituto Federal de Educação, Ciência e Tecnologia de Pernambuco (IFPE)</strong>, sendo operado e evoluído pela <strong>InovaLabs Inova Simples (I.S.)</strong> na qualidade de <em>spinoff</em> acadêmica licenciada mediante anuência institucional do Núcleo de Inovação Tecnológica (NIT/IFPE).
                </p>
              </SubClause>
              <SubClause title="1.3. Objeto da Plataforma">
                <p>
                  O DoeCerto consiste em uma infraestrutura tecnológica de impacto social (<em>Social Tech / Civic Tech</em>) destinada a conectar doadores (pessoas físicas ou jurídicas) a Organizações da Sociedade Civil sem fins lucrativos (ONGs) previamente submetidas a protocolo automatizado e documental de verificação, viabilizando:
                </p>
                <BulletList
                  items={[
                    "A realização de doações financeiras diretas via Pix Dinâmico automatizado ou Pix direto para microdoações;",
                    "A divulgação de listas de necessidades materiais (Mural de Wishlist) para articulação de doações de itens físicos;",
                    "A transparência ativa de métricas de impacto social estimado e conformidade cadastral perante bases públicas governamentais.",
                  ]}
                />
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 2 */}
            <ClauseCard id="secao-2" num="02" title="Definições Técnicas e Jurídicas">
              <p>
                Para a correta interpretação deste instrumento, os termos abaixo terão os seguintes significados:
              </p>
              <BulletList
                items={[
                  {
                    bold: "Doador Cadastrado:",
                    text: "Pessoa física plenamente capaz ou pessoa jurídica titular de conta ativa na Plataforma que realiza contribuições financeiras ou materiais.",
                  },
                  {
                    bold: "Doador Visitante (Guest Checkout):",
                    text: "Usuário que realiza doação avulsa sem criação de conta permanente, mediante fornecimento dos dados mínimos exigidos pelo Banco Central do Brasil para emissão de cobrança Pix (Nome completo e CPF válido) e aceite expresso destes Termos.",
                  },
                  {
                    bold: "ONG / OSC:",
                    text: "Organização da Sociedade Civil, associação ou fundação privada sem fins lucrativos (art. 44, I e III do Código Civil e Lei nº 13.019/2014), com CNPJ ativo no Brasil e aprovada no processo de verificação do DoeCerto.",
                  },
                  {
                    bold: "Instituição de Pagamento Parceira (Asaas I.P.):",
                    text: "Asaas Gestão Financeira Instituição de Pagamento S.A. (CNPJ nº 19.540.550/0001-21), instituição de pagamento autorizada e supervisionada pelo Banco Central do Brasil (código de compensação nº 461), responsável pelo processamento de cobranças Pix, manutenção de subcontas de pagamento e liquidação financeira.",
                  },
                  {
                    bold: "Subconta White-Label (Direct-to-Subaccount):",
                    text: "Conta de pagamento individualizada, aberta e mantida em nome e sob o CNPJ exclusivo de cada ONG diretamente na infraestrutura da Asaas I.P., na qual são geradas as cobranças de Pix Dinâmico.",
                  },
                  {
                    bold: "Gorjeta Voluntária (Tip Model / Apoio DoeCerto):",
                    text: "Valor adicional e estritamente opcional que o Doador pode, por sua livre escolha, acrescentar no momento do checkout para remunerar a InovaLabs I.S. pelos custos de manutenção tecnológica, servidores e segurança da Plataforma.",
                  },
                  {
                    bold: "Split Nativo de Pagamento:",
                    text: "Procedimento técnico executado automaticamente pela Asaas I.P. no exato momento da liquidação financeira do Pix, que segrega na fonte o valor da Doação (destinado integralmente à ONG) e o valor da Gorjeta Voluntária opcional (destinado à carteira da Operadora).",
                  },
                  {
                    bold: "Período de Retenção Preventiva (Hold Period):",
                    text: "Janela temporal de segurança antifraude (padrão de 48 horas / 2 dias após a confirmação do pagamento) antes do disparo automático da transferência externa (Pix Payout) da subconta da ONG para sua conta bancária externa.",
                  },
                  {
                    bold: "Risk Score & Compliance CGU:",
                    text: "Índice algorítmico interno (escala de 0 a 100) calculado a partir de consultas automatizadas às bases da Receita Federal e da Controladoria-Geral da União (CEIS, CNEP, CEPIM e CEAF).",
                  },
                ]}
              />
            </ClauseCard>

            {/* SEÇÃO 3 */}
            <ClauseCard id="secao-3" num="03" title="Elegibilidade, Cadastro, Autenticação 2FA e Dispositivos Confiáveis">
              <SubClause title="3.1. Capacidade Civil e Representação Legal">
                <p>
                  Os serviços da Plataforma são destinados exclusivamente a pessoas físicas maiores de 18 (dezoito) anos, plenamente capazes na forma da lei civil, ou a pessoas jurídicas e ONGs representadas por seus administradores estatutariamente constituídos. Ao concluir o cadastro ou realizar uma doação, o Usuário declara, sob as penas da lei (art. 299 do Código Penal — falsidade ideológica), possuir capacidade civil plena e legitimidade para celebrar este contrato.
                </p>
              </SubClause>
              <SubClause title="3.2. Unicidade Cadastral e Veracidade das Informações">
                <p>
                  É permitido apenas um único cadastro ativo por CPF (Doador) ou por CNPJ (ONG). O Usuário compromete-se a fornecer dados exatos, completos e atualizados, responsabilizando-se civil e criminalmente por qualquer inexatidão. O uso de dados de terceiros sem procuração ou autorização legal ensejará o bloqueio sumário da conta e comunicação às autoridades competentes.
                </p>
              </SubClause>
              <SubClause title="3.3. Segurança de Sessão, 2FA (TOTP) e Dispositivos Confiáveis">
                <p>
                  A Plataforma emprega arquitetura de segurança baseada em cookies criptográficos <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">HttpOnly</code>, proteção anti-bot via <strong>Cloudflare Turnstile</strong> e suporte nativo a Autenticação em Dois Fatores (2FA) no padrão RFC 6238 (TOTP), além de códigos de recuperação de uso único (<em>Recovery Codes</em>) e credenciais de Dispositivos Confiáveis (<em>Trusted Devices</em> com validade máxima de 30 dias).
                </p>
                <BulletList
                  items={[
                    "A guarda e o sigilo da senha de acesso, do aplicativo autenticador 2FA e dos códigos de recuperação são de responsabilidade exclusiva e intransferível do Usuário;",
                    "Para contas de ONGs e Administradores, a habilitação e manutenção de mecanismos reforçados de autenticação podem ser exigidas como condição obrigatória para alteração de dados bancários e chaves Pix;",
                    "Qualquer suspeita de comprometimento de credenciais deve ser comunicada imediatamente ao canal seguranca@doecerto.net.br.",
                  ]}
                />
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 4 */}
            <ClauseCard id="secao-4" num="04" title="Natureza Jurídica do DoeCerto e Ausência de Custódia Financeira">
              <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm leading-relaxed space-y-2 mb-4">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-xs">
                  <ShieldCheck size={16} />
                  <span>Cláusula Essencial de Arquitetura Regulatória</span>
                </div>
                <p>
                  A <strong>INOVALABS INOVA SIMPLES (I.S.)</strong> NÃO É INSTITUIÇÃO FINANCEIRA, INSTITUIÇÃO DE PAGAMENTO, SOCIEDADE DE CRÉDITO, CUSTODIANTE OU DEPOSITÁRIA DE VALORES. O DoeCerto atua única e exclusivamente como provedor de aplicação de internet e orquestrador tecnológico via API.
                </p>
              </div>
              <SubClause title="4.1. Emissão Direta na Subconta da ONG (Direct-to-Subaccount)">
                <p>
                  Todas as cobranças de Pix Dinâmico geradas na Plataforma são emitidas diretamente na <strong>Subconta de Pagamento individual de titularidade da própria ONG beneficiária</strong> junto à Asaas Gestão Financeira Instituição de Pagamento S.A. (BACEN nº 461), mediante uso de chave de API exclusiva da subconta da instituição criptografada em repouso (AES-256-GCM).
                </p>
              </SubClause>
              <SubClause title="4.2. Inexistência de Trânsito Contábil pela Operadora">
                <p>
                  Os valores doados às ONGs <strong>jamais transitam pela conta bancária ou pelo patrimônio da InovaLabs I.S.</strong>, ingressando diretamente no patrimônio da respectiva ONG no ato da liquidação do Pix pelo sistema financeiro nacional (SPI/BACEN). Consequentemente, a Operadora não responde como depositária, devedora solidária ou garantidora das quantias doadas.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 5 */}
            <ClauseCard id="secao-5" num="05" title="Arquitetura de Pagamentos, Pix Dinâmico, Microdoações e Tarifas">
              <SubClause title="5.1. Duplo Fluxo de Doações Financeiras">
                <p>
                  Para democratizar o acesso à filantropia e evitar que tarifas bancárias inviabilizem pequenas contribuições, o DoeCerto opera sob duas modalidades técnicas transparentes, detalhadas também em nossa página de{" "}
                  <Link href="/metodologia" className="text-[#6B39A7] font-bold underline">
                    Metodologia
                  </Link>
                  :
                </p>
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm rounded-2xl overflow-hidden border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="p-3.5 border-b border-slate-200">Modalidade</th>
                        <th className="p-3.5 border-b border-slate-200">Faixa de Valor</th>
                        <th className="p-3.5 border-b border-slate-200">Processamento e Conciliação</th>
                        <th className="p-3.5 border-b border-slate-200">Taxa da Liquidante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600">
                      <tr>
                        <td className="p-3.5 font-bold text-slate-900">Pix Dinâmico (Asaas I.P.)</td>
                        <td className="p-3.5 font-mono">A partir de R$ 5,00</td>
                        <td className="p-3.5">QR Code dinâmico gerado na subconta Asaas da ONG com confirmação automática via Webhook em tempo real.</td>
                        <td className="p-3.5 font-mono font-semibold text-[#6B39A7]">~R$ 0,99 fixo por Pix liquidado (deduzido na fonte pela Asaas)</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-slate-900">Microdoação / Pix Direto</td>
                        <td className="p-3.5 font-mono">Abaixo de R$ 5,00 (ou fluxo manual)</td>
                        <td className="p-3.5">Transferência direta para a chave Pix da ONG com envio obrigatório do arquivo de comprovante para conferência manual da ONG.</td>
                        <td className="p-3.5 font-mono font-semibold text-emerald-700">R$ 0,00 (0%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubClause>
              <SubClause title="5.2. Regras Específicas sobre Comprovantes Manuais">
                <p>
                  Nas doações realizadas mediante upload de comprovante (microdoações ou Pix direto), a confirmação do status da doação depende exclusivamente da conferência bancária e validação manual pela própria ONG destinatária. O envio de comprovantes falsos, adulterados, agendados e posteriormente cancelados, ou referentes a transações inexistentes configura ilícito civil e penal (art. 171 e art. 298 do Código Penal), sujeitando o infrator ao banimento imediato, exclusão da pontuação de impacto e responsabilização judicial.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 6 */}
            <ClauseCard id="secao-6" num="06" title="Modelo de Sustentabilidade (Gorjeta Voluntária / Tip Model) e Split Nativo">
              <SubClause title="6.1. Gratuidade para ONGs e Comissão Obrigatória Zero">
                <p>
                  O cadastro, a verificação de compliance e a manutenção de perfil das ONGs no DoeCerto são <strong>100% gratuitos</strong>, não havendo cobrança de taxa de adesão, mensalidade ou retenção percentual obrigatória sobre o valor base das doações arrecadadas.
                </p>
              </SubClause>
              <SubClause title="6.2. Natureza Jurídica da Gorjeta Voluntária (Apoio DoeCerto)">
                <p>
                  No momento do checkout de uma doação via Pix Dinâmico, o Doador poderá, de forma <strong>estritamente facultativa, livre e transparente</strong>, optar por incluir um valor adicional de apoio à plataforma (<em>Gorjeta Voluntária / Tip</em>, sugerida em percentuais de 5%, 10%, 15%, valor personalizado ou R$ 0,00).
                </p>
                <BulletList
                  items={[
                    "O valor da Gorjeta Voluntária NÃO se confunde com a doação destinada à ONG: trata-se de remuneração autônoma e liberalidade contratual paga diretamente pelo Doador à INOVALABS INOVA SIMPLES (I.S.) para custear servidores em nuvem, segurança cibernética, auditoria automatizada e evolução tecnológica do ecossistema;",
                    "A separação entre o montante da Doação (pertencente à ONG) e o montante da Gorjeta Voluntária (pertencente à InovaLabs I.S.) ocorre de maneira atômica e automatizada na fonte de liquidação através de regra de Split Nativo executada pela Asaas I.P. (`walletId` da conta mestre da Operadora);",
                    "Uma vez processada a transação e prestado o serviço tecnológico de intermediação e conciliação, a Gorjeta Voluntária torna-se definitiva e não reembolsável, salvo em hipótese de erro técnico comprovado de processamento em duplicidade.",
                  ]}
                />
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 7 */}
            <ClauseCard id="secao-7" num="07" title="Liquidação, Trava Preventiva Antifraude (Hold Period) e Contestação (MED / Chargeback)">
              <SubClause title="7.1. Janela de Retenção Preventiva de Segurança (48 Horas)">
                <p>
                  Para proteger as próprias ONGs e o ecossistema contra fraudes no Sistema de Pagamentos Instantâneos, lavagem de dinheiro, triangulação ilícita ou acionamento indevido do <strong>Mecanismo Especial de Devolução (MED)</strong> regulamentado pelo Banco Central do Brasil, os valores liquidados na subconta Asaas da ONG observam um <strong>Período de Retenção Preventiva (<em>Hold Period</em>) padrão de 2 (dois) dias (48 horas)</strong> a contar da confirmação do pagamento (`verifiedAt`).
                </p>
              </SubClause>
              <SubClause title="7.2. Repasse Automatizado para a Conta Bancária Externa da ONG">
                <p>
                  Transcorrido o período de segurança de 48 horas sem apontamento de fraude, bloqueio regulatório ou contestação, o agendador automatizado da Plataforma instrui a Asaas I.P. a executar a transferência via Pix (<em>Payout</em>) do valor líquido diretamente da subconta da ONG para a chave Pix / conta bancária externa de mesma titularidade (CNPJ da ONG) cadastrada em seu perfil.
                </p>
              </SubClause>
              <SubClause title="7.3. Bloqueio Cautelar (Under Review), Estornos e Responsabilidade da ONG">
                <BulletList
                  items={[
                    "A Asaas I.P. e/ou o DoeCerto poderão, a qualquer tempo e independentemente de aviso prévio, colocar transações ou transferências em status de análise de risco (`under_review`), suspender repasses ou reter cautelarmente valores caso identifiquem indícios de fraude, atipicidade transacional, inconsistência documental superveniente ou determinação do Banco Central / Poder Judiciário;",
                    "Caso ocorra estorno, devolução via MED/BACEN ou ordem judicial de bloqueio após o valor já ter sido transferido para a conta bancária externa da ONG, a ONG reconhece ser a única e exclusiva responsável pela recomposição do saldo perante a instituição de pagamento, isentando integralmente a InovaLabs I.S. de qualquer dever de cobertura financeira.",
                  ]}
                />
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 8 */}
            <ClauseCard id="secao-8" num="08" title="Caráter Irrevogável das Doações e Isenção de Consultoria Tributária">
              <SubClause title="8.1. Irrevogabilidade da Liberalidade (Código Civil, Art. 538)">
                <p>
                  As doações realizadas por meio da Plataforma constituem atos de mera liberalidade regidos pelos artigos 538 e seguintes do Código Civil Brasileiro. <strong>Não se aplica às doações filantrópicas o direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor</strong>, haja vista a inexistência de relação de consumo ou aquisição de produto/serviço pelo Doador perante a ONG. Após a confirmação da liquidação financeira do Pix, a doação é considerada <strong>irrevogável e irretratável</strong>, não cabendo pedido de reembolso por mudança de vontade do Doador.
                </p>
              </SubClause>
              <SubClause title="8.2. Isenção de Responsabilidade Fiscal e Tributária">
                <p>
                  O comprovante eletrônico emitido pelo DoeCerto tem finalidade meramente informativa de registro de transação na Plataforma. <strong>O DoeCerto não presta consultoria contábil ou jurídica nem garante que as doações realizadas sejam dedutíveis do Imposto de Renda (IRPF ou IRPJ).</strong> Eventual aproveitamento de incentivos fiscais (como deduções por empresas tributadas pelo Lucro Real nos termos da Lei nº 9.249/1995 ou legislação correlata) depende da qualificação específica de cada ONG e da emissão de recibo oficial pela própria entidade beneficiária, cabendo ao Doador consultar previamente seu contador.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 9 */}
            <ClauseCard id="secao-9" num="09" title="Doação como Visitante (Guest Checkout)">
              <p>
                A Plataforma permite que Doadores realizem contribuições financeiras ou iniciem doações sem a necessidade de criar uma conta permanente (fluxo de <em>Guest Checkout</em>), observadas as seguintes condições:
              </p>
              <BulletList
                items={[
                  "Por exigência regulatória do Banco Central do Brasil e da instituição de pagamento Asaas I.P., a emissão de QR Code de Pix Dinâmico requer obrigatoriamente a informação de Nome completo e CPF válido do pagador, além de endereço de e-mail para envio do comprovante;",
                  "Para proteger contas existentes contra enumeração ou sequestro de sessão, doações de visitantes são gravadas de forma estritamente isolada (`donorId = null`), identificadas publicamente apenas por chave randômica opaca (UUID v4) e acompanhadas do registro imutável do carimbo de tempo de aceite (`guestConsentAt`);",
                  "O Doador Visitante declara que o CPF e o e-mail informados lhe pertencem legitimamente, respondendo integralmente pelo uso indevido de dados de terceiros.",
                ]}
              />
            </ClauseCard>

            {/* SEÇÃO 10 */}
            <ClauseCard id="secao-10" num="10" title="Doações de Materiais e Itens Físicos (Mural de Necessidades / Wishlist)">
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2 mb-4">
                <div className="flex items-center gap-2 font-bold text-amber-800 uppercase tracking-wider text-xs">
                  <AlertTriangle size={16} />
                  <span>Isenção de Responsabilidade Logística e Presencial</span>
                </div>
                <p>
                  Nas doações de bens materiais (alimentos, roupas, ração, medicamentos, equipamentos ou quaisquer itens físicos listados na <em>Wishlist</em> da ONG), a atuação do DoeCerto encerra-se na aproximação digital inicial entre Doador e ONG.
                </p>
              </div>
              <BulletList
                items={[
                  "O DoeCerto NÃO realiza coleta, transporte, frete, armazenamento, inspeção sanitária ou entrega física de quaisquer mercadorias ou doações materiais;",
                  "Ao registrar a intenção de doar itens físicos, o Doador é redirecionado para combinar diretamente com a ONG (via WhatsApp ou canal institucional da organização) o local, data, horário e forma de entrega;",
                  "Cabe exclusivamente à ONG verificar a integridade, validade, procedência e adequação sanitária dos itens recebidos, podendo recusar materiais que ofereçam risco à saúde ou segurança de seus assistidos;",
                  "A InovaLabs I.S. não se responsabiliza, sob nenhuma hipótese, por acidentes, danos pessoais ou materiais, extravios, não comparecimento, vícios dos bens doados ou ilícitos ocorridos durante encontros presenciais ou tratativas externas entre Doadores e ONGs.",
                ]}
              />
            </ClauseCard>

            {/* SEÇÃO 11 */}
            <ClauseCard id="secao-11" num="11" title="Protocolo de Compliance Governamental, KYC e Limites do Selo de Verificação">
              <SubClause title="11.1. Escopo da Auditoria Automatizada e Documental">
                <p>
                  Para ingressar e permanecer ativa no catálogo público do DoeCerto, toda ONG passa por protocolo de conformidade que compreende: (i) validação documental de KYC (Estatuto Social registrado, Ata de Eleição da Diretoria vigente, Cartão CNPJ e identificação do representante legal); e (ii) varredura automatizada em bases públicas da <strong>Receita Federal do Brasil</strong> e do <strong>Portal da Transparência da Controladoria-Geral da União (CGU)</strong>, abrangendo:
                </p>
                <BulletList
                  items={[
                    { bold: "CEPIM:", text: "Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas;" },
                    { bold: "CEIS:", text: "Cadastro Nacional de Empresas Inidôneas e Suspensas;" },
                    { bold: "CNEP:", text: "Cadastro Nacional de Empresas Punidas (Lei Anticorrupção — Lei nº 12.846/2013);" },
                    { bold: "CEAF:", text: "Cadastro de Expulsões da Administração Federal (cruzamento do CPF do presidente/dirigente)." },
                  ]}
                />
              </SubClause>
              <SubClause title="11.2. Limitação Jurídica do Selo DoeCerto (Obrigação de Meio)">
                <p>
                  O Usuário e o Doador declaram plena ciência de que o Selo de Verificação e o <em>Risk Score</em> constituem <strong>instrumentos informativos de diligência prévia (obrigação de meio, e não de resultado)</strong>, baseados na fotografia dos dados públicos oficiais e documentos apresentados até a data da análise.
                </p>
                <p className="font-semibold text-slate-900">
                  A aprovação cadastral de uma ONG no DoeCerto NÃO constitui certificação de auditoria contábil independente, parecer jurídico, aval, fiança, seguro ou garantia irrestrita sobre a conduta futura de seus dirigentes ou sobre a efetiva aplicação prática dos recursos após a transferência bancária. A gestão administrativa, financeira, trabalhista e estatutária dos valores e bens recebidos é de responsabilidade exclusiva, integral e indelegável da respectiva ONG e de seus administradores.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 12 */}
            <ClauseCard id="secao-12" num="12" title="Obrigações das Partes, Condutas Vedadas e Sanções">
              <SubClause title="12.1. Obrigações Específicas das ONGs Cadastradas">
                <BulletList
                  items={[
                    "Manter rigorosamente atualizados seu Estatuto Social, Ata de Diretoria, CNPJ, endereço e dados do representante legal, comunicando qualquer alteração ou restrição superveniente em até 5 (cinco) dias úteis;",
                    "Utilizar exclusivamente conta bancária e chave Pix de titularidade da própria pessoa jurídica da ONG (mesmo CNPJ), sendo terminantemente proibido o cadastro de contas bancárias de pessoas físicas, dirigentes ou terceiros;",
                    "Aplicar integralmente os recursos e materiais arrecadados nas finalidades institucionais e projetos descritos em seu perfil, prestando contas à sociedade e aos órgãos de fiscalização;",
                    "Analisar e validar com boa-fé e celeridade os comprovantes de microdoações e entregas de itens físicos recebidos.",
                  ]}
                />
              </SubClause>
              <SubClause title="12.2. Condutas Expressamente Proibidas a Todos os Usuários">
                <BulletList
                  items={[
                    "Utilizar a Plataforma para lavagem de capitais, ocultação de bens, financiamento ao terrorismo, retorno financeiro dissimulado ao próprio doador (auto-doação fraudulenta) ou evasão de divisas;",
                    "Empregar robôs, spiders, scripts de scraping, ataques de negação de serviço (DDoS), força bruta ou tentar contornar o Cloudflare Turnstile, limites de requisição (Rate Limiting) e travas de segurança da API;",
                    "Publicar campanhas enganosas, utilizar fotografias de terceiros sem autorização ou induzir doadores em erro quanto à destinação dos recursos.",
                  ]}
                />
              </SubClause>
              <SubClause title="12.3. Medidas Disciplinares e Suspensão Sumária">
                <p>
                  A violação de qualquer disposição destes Termos, a elevação crítica do <em>Risk Score</em> por apontamento nas bases da CGU/Receita Federal ou a identificação de comportamento suspeito facultará à Operadora a suspensão cautelar ou o banimento definitivo da conta, a revogação imediata do Selo de Verificação e a retenção preventiva de repasses pendentes para averiguação, sem prejuízo da comunicação ao COAF, Ministério Público e autoridades policiais.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 13 */}
            <ClauseCard id="secao-13" num="13" title="Propriedade Intelectual e Licença de Exibição Institucional">
              <SubClause title="13.1. Direitos Reservados (INPI BR512026005500-8)">
                <p>
                  Todo o código-fonte, arquitetura de software, algoritmos de cálculo de impacto social e de <em>Risk Score</em>, banco de dados, layout, identidade visual (&ldquo;DoeCerto Tech&rdquo;), logotipos e textos originais são protegidos pela Lei de Software (Lei nº 9.609/1998), pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pela Lei da Propriedade Industrial (Lei nº 9.279/1996), sob titularidade do <strong>IFPE</strong> e operação licenciada da <strong>INOVALABS INOVA SIMPLES (I.S.)</strong> (Registro INPI nº <span className="font-mono">BR512026005500-8</span>). É terminantemente proibida a cópia, engenharia reversa, descompilação ou exploração comercial não autorizada.
                </p>
              </SubClause>
              <SubClause title="13.2. Licença Concedida pelas ONGs e Usuários">
                <p>
                  Ao cadastrar-se na Plataforma, a ONG concede à Operadora licença gratuita, não exclusiva, válida em todo o território nacional e enquanto durar seu cadastro, para exibir seu nome, logotipo, fotografias institucionais, listas de necessidades e indicadores agregados de transparência e impacto social no catálogo público do DoeCerto e em materiais institucionais de divulgação do ecossistema.
                </p>
              </SubClause>
            </ClauseCard>

            {/* SEÇÃO 14 */}
            <ClauseCard id="secao-14" num="14" title="Limitação Geral de Responsabilidade, Indenização e Foro">
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-800 leading-relaxed uppercase tracking-wide">
                Na máxima extensão permitida pela legislação brasileira aplicável, a InovaLabs Inova Simples (I.S.), seus sócios, desenvolvedores e o Instituto Federal de Pernambuco (IFPE) não respondem, solidária ou subsidiariamente, por: (I) desvio de finalidade, má gestão, inexecução de projetos ou atos ilícitos praticados por ONGs cadastradas ou seus representantes; (II) indisponibilidade temporária, atrasos de liquidação ou falhas operacionais do Sistema de Pagamentos Instantâneos (Pix/BACEN), da instituição de pagamento Asaas I.P., de serviços de nuvem ou de APIs governamentais (CGU/Receita Federal); (III) danos indiretos, lucros cessantes ou perda de oportunidade; ou (IV) incidentes ocorridos na entrega presencial de doações materiais.
              </div>
              <SubClause title="14.1. Cláusula de Indenização e Direito de Regresso">
                <p>
                  O Usuário (Doador ou ONG) que violar estes Termos, fornecer informações falsas, praticar fraude ou der causa a qualquer reclamação, autuação administrativa ou demanda judicial contra a <strong>InovaLabs Inova Simples (I.S.)</strong> ou contra o <strong>IFPE</strong> obriga-se a defender, isentar e ressarcir integralmente todas as perdas, danos, condenações, custas processuais e honorários advocatícios suportados pela Operadora, nos termos do art. 927 e art. 934 do Código Civil.
                </p>
              </SubClause>
              <SubClause title="14.2. Alterações destes Termos">
                <p>
                  Estes Termos poderão ser atualizados periodicamente para refletir evoluções tecnológicas, operacionais ou legislativas. Alterações substanciais serão comunicadas na Plataforma ou por e-mail com antecedência razoável, entrando em vigor imediatamente quando decorrerem de imposição legal ou regulatória.
                </p>
              </SubClause>
              <SubClause title="14.3. Legislação Aplicável, Canais de Contato e Foro de Eleição">
                <p>
                  Este instrumento é regido pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias oriundas destes Termos, fica eleito o <strong>Foro da Comarca de Igarassu/PE</strong> ou o <strong>Foro da Comarca de Recife/PE</strong>, a critério da Operadora na defesa de seus interesses, com renúncia expressa a qualquer outro, por mais privilegiado que seja, ressalvadas as hipóteses de competência absoluta previstas em lei.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block font-bold text-slate-900">Atendimento Geral</span>
                    <span className="text-[#6B39A7] font-mono">contato@doecerto.net.br</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Privacidade & DPO (LGPD)</span>
                    <span className="text-[#6B39A7] font-mono">privacidade@doecerto.net.br</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Segurança & Compliance</span>
                    <span className="text-[#6B39A7] font-mono">seguranca@doecerto.net.br</span>
                  </div>
                </div>
              </SubClause>
            </ClauseCard>
          </div>
        </div>
      </main>

      {/* FOOTER NO PADRÃO DOECERTO TECH */}
      <footer className="border-t border-slate-100 bg-slate-50/60 py-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              © {new Date().getFullYear()} DoeCerto — Operado por INOVALABS INOVA SIMPLES (I.S.) • CNPJ 68.163.255/0001-09
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Registro de Programa de Computador INPI nº BR512026005500-8 (Titular: IFPE • Licenciado via NIT/IFPE)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-medium">
            <Link href="/terms" className="text-[#6B39A7] font-bold">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="hover:text-[#6B39A7] transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/metodologia" className="hover:text-[#6B39A7] transition-colors">
              Metodologia
            </Link>
            <Link href="/help-center" className="hover:text-[#6B39A7] transition-colors">
              Central de Ajuda
            </Link>
            <Link href="/" className="hover:text-[#6B39A7] transition-colors">
              Página Inicial
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Componentes Auxiliares de Layout Jurídico DoeCerto Tech ── */

function ClauseCard({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 p-7 sm:p-9 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:border-purple-200/80 transition-colors space-y-5"
    >
      <div className="flex items-start sm:items-center gap-3.5 pb-4 border-b border-slate-100">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-purple-50 text-[#6B39A7] border border-purple-200/60 shrink-0">
          CLÁUSULA {num}
        </span>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
        {children}
      </div>
    </section>
  );
}

function SubClause({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pt-1">
      <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
      <div className="space-y-2.5 text-slate-600">{children}</div>
    </div>
  );
}

function BulletList({
  items,
}: {
  items: (string | { bold: string; text: string })[];
}) {
  return (
    <ul className="space-y-2.5 pt-1">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6B39A7] mt-2.5 shrink-0" />
          <span>
            {typeof item === "string" ? (
              item
            ) : (
              <>
                <strong className="font-bold text-slate-900">{item.bold} </strong>
                {item.text}
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
