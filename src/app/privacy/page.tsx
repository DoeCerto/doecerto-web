import Link from "next/link";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  FileJson,
  UserCheck,
  EyeOff,
  Server,
  Scale,
  Building2,
  Fingerprint,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Política de Privacidade e Proteção de Dados (LGPD)",
  description:
    "Política de Privacidade e Proteção de Dados Pessoais da plataforma DoeCerto (v5.0), operada pela InovaLabs Inova Simples (I.S.) em estrita conformidade com a LGPD (Lei nº 13.709/2018).",
};

const PRIVACY_TOC = [
  { id: "priv-1", num: "01", label: "Controladora e Encarregado (DPO)" },
  { id: "priv-2", num: "02", label: "Dados Coletados por Perfil" },
  { id: "priv-3", num: "03", label: "Finalidades e Bases Legais (LGPD)" },
  { id: "priv-4", num: "04", label: "Pagamentos, Pix e Asaas I.P." },
  { id: "priv-5", num: "05", label: "Auditoria CGU e Decisões Automatizadas" },
  { id: "priv-6", num: "06", label: "Compartilhamento e Doação Anônima" },
  { id: "priv-7", num: "07", label: "Segurança Técnica e Criptografia" },
  { id: "priv-8", num: "08", label: "Cookies, Sessão e Anti-Bot" },
  { id: "priv-9", num: "09", label: "Prazos de Retenção e Guarda Legal" },
  { id: "priv-10", num: "10", label: "Direitos LGPD e Autoatendimento" },
  { id: "priv-11", num: "11", label: "Transferência Internacional" },
  { id: "priv-12", num: "12", label: "Menores de Idade (Art. 14 LGPD)" },
  { id: "priv-13", num: "13", label: "Incidentes, Atualizações e Contato" },
];

export default function PrivacidadePage() {
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
              <Link
                href="/terms"
                className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
              >
                Termos de Uso
              </Link>
              <span className="px-4 py-1.5 rounded-full bg-white text-[#6B39A7] font-bold text-xs shadow-2xs">
                Privacidade & LGPD
              </span>
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
              <Lock size={14} />
              Versão 5.0 • Vigência: Novembro de 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
              Lei nº 13.709/2018 (LGPD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck size={14} />
              AES-256-GCM & Zero-Knowledge
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-5 max-w-4xl">
            Política de Privacidade e Proteção de Dados
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mb-12">
            Transparência e segurança cibernética fazem parte do DNA do{" "}
            <strong className="text-slate-900 font-semibold">DoeCerto</strong>. Este documento detalha de forma clara, técnica e objetiva como a{" "}
            <strong className="text-slate-900 font-semibold">INOVALABS INOVA SIMPLES (I.S.)</strong>{" "}
            coleta, trata, cifra, compartilha e protege seus dados pessoais nos termos da{" "}
            <strong className="text-slate-900 font-semibold">Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong> e do Marco Civil da Internet (Lei nº 12.965/2014).
          </p>

          {/* 4 CARDS DE RESUMO EXECUTIVO DE PRIVACIDADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <EyeOff size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  1. Zero Venda de Dados
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jamais comercializamos ou alugamos dados pessoais. Coletamos apenas o mínimo indispensável para liquidar doações via Pix, auditar ONGs e cumprir exigências do BACEN.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Seções 02, 03 e 06
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <KeyRound size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  2. Criptografia AES-256-GCM
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Credenciais financeiras são cifradas com AES-256-GCM, tokens usam hash SHA-256 em cookies HttpOnly, imagens têm metadados EXIF removidos e contas contam com 2FA (TOTP).
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Seções 07 e 08
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <FileJson size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  3. Autoatendimento LGPD
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exerça seus direitos sem burocracia: exporte todos os seus dados em JSON (Portabilidade) ou solicite a exclusão com anonimização criptográfica direto nas configurações da conta.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Seção 10
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-[#6B39A7] flex items-center justify-center mb-4">
                  <Clock size={22} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  4. Guarda Legal e Anonimização
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao excluir sua conta, seus dados identificadores são destruídos na hora, preservando-se apenas registros contábeis desidentificados por 5 anos (Art. 16, I da LGPD e CTN).
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-bold text-[#6B39A7]">
                Seções 09 e 10
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL EM 2 COLUNAS */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: ÍNDICE NAVEGÁVEL + FICHA DO CONTROLADOR/DPO */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/70">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Índice de Privacidade
                </span>
                <span className="text-xs font-mono font-bold text-[#6B39A7]">13 seções</span>
              </div>
              <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {PRIVACY_TOC.map((item) => (
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

            {/* QUADRO DO CONTROLADOR E ENCARREGADO (DPO) */}
            <div className="p-6 rounded-3xl bg-[#4A2675] text-white space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Fingerprint size={20} className="text-purple-200" />
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-purple-200 font-semibold">
                    Controladora de Dados (LGPD)
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
                  <span className="text-purple-200">Canal do DPO:</span>
                  <span className="font-mono font-semibold text-white">privacidade@doecerto.net.br</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">Prazo Legal:</span>
                  <span className="font-semibold text-white">Até 15 dias (Art. 19, II LGPD)</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="text-purple-200">Autoatendimento:</span>
                  <span className="font-semibold text-emerald-300">Imediato no Painel</span>
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/terms"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Scale size={14} />
                  <span>Ler Termos e Condições de Uso</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* COLUNA DIREITA: SEÇÕES DA POLÍTICA DE PRIVACIDADE */}
          <div className="lg:col-span-8 space-y-8">
            {/* SEÇÃO 1 */}
            <PrivacySection id="priv-1" num="01" title="Identificação da Controladora e do Encarregado de Dados (DPO)">
              <p>
                Para os fins da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — <strong>LGPD</strong>), a agente de tratamento na qualidade de <strong>Controladora</strong> dos dados pessoais coletados e tratados no âmbito da plataforma <strong>DoeCerto</strong> (<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">doecerto.net.br</span>) é a:
              </p>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm space-y-1.5">
                <p>
                  <strong className="text-slate-900">Razão Social:</strong> INOVALABS INOVA SIMPLES (I.S.)
                </p>
                <p>
                  <strong className="text-slate-900">CNPJ:</strong> <span className="font-mono">68.163.255/0001-09</span>
                </p>
                <p>
                  <strong className="text-slate-900">Sede Administrativa:</strong> Município de Igarassu, Estado de Pernambuco, Brasil
                </p>
                <p>
                  <strong className="text-slate-900">Registro INPI do Software:</strong>{" "}
                  <span className="font-mono">BR512026005500-8</span> (Titularidade originária: Instituto Federal de Pernambuco — IFPE, operado sob licença institucional via NIT/IFPE)
                </p>
                <p>
                  <strong className="text-slate-900">Canal do Encarregado pelo Tratamento de Dados (DPO — Art. 41 da LGPD):</strong>{" "}
                  <span className="font-mono text-[#6B39A7] font-semibold">privacidade@doecerto.net.br</span>
                </p>
              </div>
            </PrivacySection>

            {/* SEÇÃO 2 */}
            <PrivacySection id="priv-2" num="02" title="Categorias de Dados Pessoais e Institucionais Coletados">
              <p>
                Observando estritamente o princípio da <strong>necessidade e minimização de dados</strong> (art. 6º, III da LGPD), coletamos apenas os dados indispensáveis para cada perfil de uso da Plataforma:
              </p>

              <PrivacySub title="2.1. Dados de Doadores Cadastrados (Pessoa Física)">
                <PrivacyList
                  items={[
                    { bold: "Identificação Civil e Contato:", text: "Nome completo, número de inscrição no CPF (validado matematicamente pelos dígitos verificadores), endereço de e-mail e número de telefone/WhatsApp (opcional, salvo para agendamento de entrega de itens físicos);" },
                    { bold: "Localização e Perfil:", text: "Endereço postal ou cidade/UF (quando informado voluntariamente), foto de perfil (reprocessada com remoção automática de metadados EXIF/GPS) e biografia opcional;" },
                    { bold: "Histórico Filantrópico:", text: "Registros de doações financeiras e de materiais realizados, avaliações públicas atribuídas às ONGs apoiadas e métricas agregadas de impacto social." },
                  ]}
                />
              </PrivacySub>

              <PrivacySub title="2.2. Dados de Doadores Visitantes (Guest Checkout — Sem Conta)">
                <PrivacyList
                  items={[
                    { bold: "Dados Mínimos Regulatórios:", text: "Nome completo, CPF válido (exigido pelo Banco Central do Brasil e pela Asaas I.P. para emissão de cobrança Pix registrada), endereço de e-mail para recibo e telefone (obrigatório apenas se se tratar de doação de itens materiais);" },
                    { bold: "Isolamento e Pseudonimização:", text: "O registro da doação é gravado sem vínculo a conta de usuário (`donorId = null`), identificado externamente apenas por chave pública randômica (UUID v4), gerando-se na liquidante um identificador externo sintético opaco (hash SHA-256 truncado) e registrando-se o carimbo temporal exato do consentimento (`guestConsentAt`)." },
                  ]}
                />
              </PrivacySub>

              <PrivacySub title="2.3. Dados de ONGs e de seus Representantes Legais / Dirigentes">
                <PrivacyList
                  items={[
                    { bold: "Dados da Pessoa Jurídica:", text: "Razão Social, Nome Fantasia, CNPJ, data de fundação, endereço completo da sede, área de atuação social, telefone/WhatsApp institucional e dados bancários / chave Pix de titularidade exclusiva do CNPJ da ONG;" },
                    { bold: "Dados Pessoais do Representante Legal (KYC):", text: "Nome completo e CPF do Presidente ou dirigente estatutário responsável, estritamente necessários para: (i) verificação de idoneidade no cadastro CEAF da Controladoria-Geral da União (CGU); e (ii) abertura regulamentar da Subconta de Pagamento junto à Asaas I.P. conforme normas de Prevenção à Lavagem de Dinheiro (PLD/FT) do Banco Central;" },
                    { bold: "Documentação Institucional:", text: "Cópias digitais do Estatuto Social, Ata de Eleição da Diretoria atual e comprovante de situação cadastral no CNPJ, armazenadas em diretório privado fora da árvore pública do servidor." },
                  ]}
                />
              </PrivacySub>

              <PrivacySub title="2.4. Dados Coletados Automaticamente, Segurança e Dispositivos Confiáveis">
                <PrivacyList
                  items={[
                    { bold: "Registros de Conexão (Marco Civil da Internet):", text: "Endereço IP de origem, data e hora exatas (com fuso horário), método HTTP, rota acessada e cabeçalho User-Agent (navegador e sistema operacional);" },
                    { bold: "Dispositivos Confiáveis (Trusted Devices) e 2FA:", text: "Quando o Usuário opta por 'Confiar neste dispositivo por 30 dias' após autenticar-se via 2FA (TOTP), armazenamos o nome descritivo do navegador/SO, o endereço IP, a data de último uso e exclusivamente o hash criptográfico SHA-256 do token de confiança;" },
                    { bold: "Trilha de Auditoria (AuditLogs):", text: "Eventos sensíveis (login, alteração de senha, ativação de 2FA, aprovação de ONG, exportação ou exclusão LGPD) são gravados em tabela de auditoria imutável para segurança jurídica e forense." },
                  ]}
                />
              </PrivacySub>
            </PrivacySection>

            {/* SEÇÃO 3 */}
            <PrivacySection id="priv-3" num="03" title="Finalidades do Tratamento e Bases Legais na LGPD (Art. 7º e Art. 11)">
              <p>
                Todo tratamento de dados pessoais realizado no DoeCerto está amparado em uma hipótese legal estrita prevista na Lei nº 13.709/2018:
              </p>
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left border-collapse text-xs sm:text-sm rounded-2xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="p-3.5 border-b border-slate-200">Finalidade de Tratamento</th>
                      <th className="p-3.5 border-b border-slate-200">Dados Envolvidos</th>
                      <th className="p-3.5 border-b border-slate-200">Base Legal (LGPD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Criação de conta, autenticação e gestão do perfil de Doador ou ONG</td>
                      <td className="p-3.5">Nome, CPF/CNPJ, e-mail, senha (hash), telefone e endereço</td>
                      <td className="p-3.5 font-mono text-xs text-[#6B39A7] font-bold">Execução de Contrato (Art. 7º, V)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Emissão de cobrança Pix Dinâmico, Split Nativo e repasse bancário via Asaas I.P.</td>
                      <td className="p-3.5">Nome, CPF do pagador, valor, ID da transação e dados da subconta da ONG</td>
                      <td className="p-3.5 font-mono text-xs text-[#6B39A7] font-bold">Execução de Contrato (Art. 7º, V) e Obrigação Legal BACEN (Art. 7º, II)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Auditoria de Compliance e KYC em bases públicas (CGU: CEIS, CNEP, CEPIM, CEAF e Receita Federal)</td>
                      <td className="p-3.5">CNPJ da ONG, Nome e CPF do representante legal e documentos estatutários</td>
                      <td className="p-3.5 font-mono text-xs text-[#6B39A7] font-bold">Legítimo Interesse de Proteção à Sociedade (Art. 7º, IX) e Prevenção à Fraude (Art. 11, II, g)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Prevenção a bots, ataques cibernéticos, controle de sessão 2FA e trava antifraude de 48h</td>
                      <td className="p-3.5">IP, User-Agent, token Turnstile, hash de Trusted Device e AuditLogs</td>
                      <td className="p-3.5 font-mono text-xs text-[#6B39A7] font-bold">Legítimo Interesse / Segurança (Art. 7º, IX) e Marco Civil (Art. 7º, II)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Guarda de livro-razão de transações financeiras e defesa em processos administrativos/judiciais</td>
                      <td className="p-3.5">Registros contábeis de doações, repasses, comprovantes e logs de auditoria</td>
                      <td className="p-3.5 font-mono text-xs text-[#6B39A7] font-bold">Obrigação Legal/Tributária (Art. 7º, II e Art. 16, I) e Exercício Regular de Direitos (Art. 7º, VI)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PrivacySection>

            {/* SEÇÃO 4 */}
            <PrivacySection id="priv-4" num="04" title="Processamento de Pagamentos, Subcontas Asaas e Segregação Financeira">
              <p>
                O processamento de transações de Pix Dinâmico e a liquidação de repasses são executados pela{" "}
                <strong>Asaas Gestão Financeira Instituição de Pagamento S.A.</strong> (CNPJ nº 19.540.550/0001-21, instituição autorizada pelo Banco Central do Brasil sob o código nº 461):
              </p>
              <PrivacyList
                items={[
                  "O DoeCerto não coleta nem armazena números de cartão de crédito, senhas bancárias ou chaves privadas de contas pessoais de Doadores;",
                  "Para a geração de cada QR Code de Pix Dinâmico diretamente na subconta individual da ONG beneficiária, a API do DoeCerto transmite de forma criptografada (TLS 1.2/1.3) à Asaas I.P. apenas o Nome, o CPF e o e-mail do Doador, conforme exigido pelas normas do Arranjo de Pagamentos Instantâneos (Pix/BACEN);",
                  "O banco de dados do DoeCerto armazena apenas os metadados operacionais da transação: identificadores da cobrança (`asaasPaymentId`), status de conciliação, valores bruto/líquido/tarifa, carimbos de tempo e comprovantes.",
                ]}
              />
            </PrivacySection>

            {/* SEÇÃO 5 */}
            <PrivacySection id="priv-5" num="05" title="Auditoria Governamental Automatizada (CGU/RFB) e Revisão de Decisões (Art. 20 da LGPD)">
              <p>
                Durante o credenciamento e monitoramento contínuo de ONGs, o motor de conformidade do DoeCerto realiza consultas automatizadas utilizando o CNPJ da instituição e o CPF de seu representante legal junto à API oficial do <strong>Portal da Transparência do Governo Federal (Controladoria-Geral da União — CGU)</strong> e da <strong>Receita Federal</strong>, gerando um indicador técnico de risco (<em>Risk Score</em> de 0 a 100).
              </p>
              <p>
                Em estrito cumprimento ao <strong>art. 20 da LGPD</strong>, garantimos a qualquer representante legal de ONG o direito de solicitar a explicação dos critérios utilizados e a <strong>revisão humana por nossa equipe de Compliance</strong> de eventual decisão de reprovação cadastral, suspensão de selo ou retenção preventiva decorrente de apontamento automatizado, bastando enviar solicitação documentada para <span className="font-mono text-[#6B39A7] font-semibold">seguranca@doecerto.net.br</span>.
              </p>
            </PrivacySection>

            {/* SEÇÃO 6 */}
            <PrivacySection id="priv-6" num="06" title="Compartilhamento de Dados com Terceiros e Doação Anônima">
              <p>
                A <strong>InovaLabs Inova Simples (I.S.)</strong> não comercializa dados pessoais sob nenhuma hipótese. O compartilhamento ocorre estritamente com os seguintes operadores e destinatários:
              </p>
              <PrivacyList
                items={[
                  { bold: "Asaas Instituição de Pagamento S.A. (BACEN nº 461):", text: "Para abertura e operação das subcontas das ONGs, emissão de cobranças Pix Dinâmico, execução do Split Nativo e transferência bancária externa;" },
                  { bold: "ONG Beneficiária da Doação:", text: "Para fins de prestação de contas, recibo e articulação logística (no caso de doação de itens físicos). Caso o Doador selecione a opção de 'Doação Anônima' (`isAnonymous = true`), seu nome e dados de identificação são ocultados nas listagens e exibições públicas de apoio, mantendo-se o registro civil apenas na camada contábil e regulatória exigida pelo Banco Central;" },
                  { bold: "Cloudflare, Inc. (Turnstile & Segurança de Borda):", text: "Verificação automatizada de integridade de sessão para bloqueio de robôs e ataques de força bruta sem uso de rastreadores publicitários invasivos;" },
                  { bold: "Infraestrutura de Nuvem e E-mail Transacional (SMTP):", text: "Servidores de banco de dados, cache e disparo de e-mails transacionais (como códigos de recuperação de senha, alertas de 2FA e recibos de doação), vinculados por obrigações de confidencialidade e segurança;" },
                  { bold: "Autoridades Judiciais, Policiais ou Regulatórias (BACEN, COAF, ANPD, Receita Federal):", text: "Mediante requisição legalmente fundamentada ou ordem judicial." },
                ]}
              />
            </PrivacySection>

            {/* SEÇÃO 7 */}
            <PrivacySection id="priv-7" num="07" title="Arquitetura de Segurança da Informação e Medidas Técnicas (Art. 46 da LGPD)">
              <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm leading-relaxed space-y-2 mb-4">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-xs">
                  <Server size={16} />
                  <span>Engenharia de Segurança Aplicada (Security by Design)</span>
                </div>
                <p>
                  O DoeCerto implementa controles criptográficos e arquiteturais em nível de produção para proteger os dados contra acessos não autorizados, vazamentos, adulteração ou destruição:
                </p>
              </div>
              <PrivacyList
                items={[
                  { bold: "Criptografia Autenticada AES-256-GCM em Repouso:", text: "Chaves de API de subcontas financeiras são cifradas individualmente antes da gravação no banco de dados utilizando o algoritmo AES-256-GCM com vetor de inicialização (IV) randômico de 12 bytes e tag de autenticação criptográfica (AuthTag) de 16 bytes;" },
                  { bold: "Hashing Irreversível de Credenciais e Tokens:", text: "Senhas de usuários são processadas com algoritmos de hashing adaptativo com salt; códigos de recuperação 2FA, tokens de redefinição de senha e tokens de Dispositivos Confiáveis jamais são salvos em texto puro, armazenando-se apenas seu digest SHA-256;" },
                  { bold: "Cookies HttpOnly e Content Security Policy (CSP) com Nonce:", text: "Tokens de autenticação JWT trafegam exclusivamente em cookies `HttpOnly`, `Secure` e `SameSite`, inacessíveis via JavaScript malicioso (mitigação contra XSS), combinados com cabeçalhos CSP dinâmicos por requisição (`nonce`), HSTS e `X-Frame-Options: DENY`;" },
                  { bold: "Sanitização Binária de Uploads e Remoção de EXIF/GPS:", text: "Arquivos enviados (fotos de perfil, imagens de catálogo e comprovantes) passam por validação estrita de assinatura binária (Magic Bytes) e reprocessamento de imagem que destrói metadados ocultos de geolocalização (EXIF/GPS) e possíveis payloads embutidos;" },
                  { bold: "Isolamento RBAC de Documentos de KYC:", text: "Estatutos, atas, documentos de representantes legais e comprovantes financeiros são gravados em volumes privados fora da pasta pública da aplicação, acessíveis apenas mediante endpoint autenticado com verificação estrita de controle de acesso baseado em papéis (RBAC) e propriedade (IDOR protection)." },
                ]}
              />
            </PrivacySection>

            {/* SEÇÃO 8 */}
            <PrivacySection id="priv-8" num="08" title="Política de Cookies, Armazenamento Local e Proteção Anti-Bot">
              <p>
                Não utilizamos cookies de publicidade comportamental de terceiros nem vendemos espaço para redes de anúncios. Utilizamos apenas tecnologias estritamente necessárias ao funcionamento seguro da Plataforma:
              </p>
              <PrivacyList
                items={[
                  { bold: "Cookies Estritamente Necessários de Autenticação (`HttpOnly`):", text: "Mantêm a sessão autenticada do Usuário com segurança criptográfica e protegem contra falsificação de requisições (CSRF). São indispensáveis para o login;" },
                  { bold: "Cookie de Dispositivo Confiável (`trusted_device`):", text: "Gravado somente mediante solicitação expressa do Usuário ao marcar a opção de lembrar o dispositivo no login 2FA, com validade automática de 30 dias;" },
                  { bold: "Verificação Anti-Bot (Cloudflare Turnstile):", text: "Executa desafios criptográficos não intrusivos no navegador para proteger rotas críticas (cadastro, login, recuperação de senha e geração de Pix) contra ataques automatizados;" },
                  { bold: "Armazenamento Local de Interface (`sessionStorage` / `localStorage`):", text: "Utilizado apenas para preservar temporariamente o estado visual de navegação (como posição de rolagem ou rascunho de checkout Pix ativo contra atualização acidental da página)." },
                ]}
              />
            </PrivacySection>

            {/* SEÇÃO 9 */}
            <PrivacySection id="priv-9" num="09" title="Tabela de Retenção, Guarda Legal e Descarte Seguro (Art. 15 e Art. 16 da LGPD)">
              <p>
                Os dados pessoais são mantidos somente pelo período necessário ao cumprimento de suas finalidades ou pelos prazos determinados em lei:
              </p>
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left border-collapse text-xs sm:text-sm rounded-2xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="p-3.5 border-b border-slate-200">Categoria de Dado / Registro</th>
                      <th className="p-3.5 border-b border-slate-200">Prazo de Retenção</th>
                      <th className="p-3.5 border-b border-slate-200">Fundamento Legal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Dados cadastrais de conta ativa (Doador ou ONG)</td>
                      <td className="p-3.5">Enquanto a conta permanecer ativa</td>
                      <td className="p-3.5">Art. 7º, V da LGPD (Execução de Contrato)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Livro-razão de transações financeiras, doações, splits e repasses bancários</td>
                      <td className="p-3.5 font-mono font-bold text-[#6B39A7]">5 (cinco) anos após a conclusão do exercício</td>
                      <td className="p-3.5">Art. 16, I da LGPD, Art. 173 do Código Tributário Nacional (CTN) e normas do BACEN</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Registros de conexão e acesso à aplicação (IP, data e hora)</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">Mínimo de 6 (seis) meses</td>
                      <td className="p-3.5">Art. 15 do Marco Civil da Internet (Lei nº 12.965/2014)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Logs de auditoria de segurança (`AuditLog`) e exercício de direitos LGPD</td>
                      <td className="p-3.5 font-mono">Até 5 (cinco) anos</td>
                      <td className="p-3.5">Art. 7º, VI da LGPD e Art. 206, § 3º, V do Código Civil (Prazo prescricional)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Tokens de Dispositivos Confiáveis e Links de Recuperação de Senha</td>
                      <td className="p-3.5 font-mono">30 dias (Trusted Device) / 1 hora (Reset de Senha)</td>
                      <td className="p-3.5">Expurgo automático por expiração temporal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PrivacySection>

            {/* SEÇÃO 10 */}
            <PrivacySection id="priv-10" num="10" title="Direitos do Titular e Autoatendimento Automatizado (Self-Service LGPD)">
              <p>
                Nos termos do <strong>art. 18 da LGPD</strong>, você possui o direito gratuito de solicitar a confirmação da existência de tratamento, o acesso aos dados, a correção de dados incompletos ou desatualizados, a anonimização/bloqueio/eliminação de dados desnecessários, a portabilidade, a informação sobre compartilhamentos e a revogação do consentimento.
              </p>

              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-4 my-3">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#6B39A7]" />
                  <span>Ferramentas de Autoatendimento LGPD em Tempo Real na Plataforma</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Além do atendimento via Encarregado (DPO), o DoeCerto disponibiliza diretamente no painel de configurações da conta do Usuário dois recursos técnicos automatizados de execução imediata:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-purple-100 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-[#6B39A7] uppercase">
                      Art. 18, II e V • Portabilidade
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      1. Exportação Integral em JSON
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Permite baixar instantaneamente um arquivo estruturado e interoperável (`.json`) contendo todos os seus dados cadastrais, endereço, histórico de doações, avaliações, notificações e dispositivos vinculados.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-purple-100 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-[#6B39A7] uppercase">
                      Art. 18, IV e VI • Eliminação
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      2. Exclusão e Anonimização Criptográfica
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Mediante confirmação de senha e 2FA (quando ativo), destrói imediatamente fotos e documentos em disco, revoga todas as sessões e substitui Nome, E-mail, CPF/CNPJ e Telefone por hashes criptográficos irreversíveis, preservando apenas o livro-razão financeiro desidentificado (Art. 16, I da LGPD).
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                <strong>Nota de Segurança sobre Contas de ONGs:</strong> Caso uma ONG possua doações confirmadas cujo repasse bancário ainda esteja em trânsito ou agendado (`pending`, `processing` ou `under_review`), a exclusão da conta aguarda a conclusão da liquidação financeira para impedir a perda de fundos pertencentes à própria instituição.
              </p>
            </PrivacySection>

            {/* SEÇÃO 11 */}
            <PrivacySection id="priv-11" num="11" title="Transferência Internacional de Dados (Art. 33 da LGPD)">
              <p>
                A infraestrutura de servidores, banco de dados, proteção de borda (Cloudflare) e serviços de mensageria utilizados pela Operadora pode envolver o processamento ou armazenamento criptografado em datacenters localizados no Brasil ou no exterior (como nos Estados Unidos da América ou União Europeia). Em todos os casos, a <strong>InovaLabs Inova Simples (I.S.)</strong> assegura a observância do art. 33 da LGPD, contratando exclusivamente provedores de padrão internacional (ISO/IEC 27001, SOC 2) sujeitos a cláusulas contratuais de proteção de dados e criptografia ponta a ponta.
              </p>
            </PrivacySection>

            {/* SEÇÃO 12 */}
            <PrivacySection id="priv-12" num="12" title="Proteção de Crianças e Adolescentes (Art. 14 da LGPD)">
              <p>
                A Plataforma não é direcionada a menores de 18 (dezoito) anos. Não coletamos intencionalmente dados pessoais de crianças ou adolescentes sem o consentimento específico e em destaque de pelo menos um de seus pais ou pelo responsável legal (art. 14, § 1º da LGPD). Caso identifiquemos o cadastro indevido de menor sem representação legal válida, a conta será imediatamente bloqueada e os respectivos dados pessoais eliminados de forma segura.
              </p>
            </PrivacySection>

            {/* SEÇÃO 13 */}
            <PrivacySection id="priv-13" num="13" title="Resposta a Incidentes (Art. 48 da LGPD), Atualizações e Contato">
              <PrivacySub title="13.1. Plano de Resposta a Incidentes e Notificação à ANPD">
                <p>
                  Mantemos monitoramento contínuo de segurança e trilha de auditoria. Na hipótese de ocorrência de qualquer incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a Operadora acionará seu protocolo de contenção forense e comunicará o fato, em prazo razoável, aos titulares afetados e à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>, em estrita observância ao art. 48 da LGPD.
                </p>
              </PrivacySub>
              <PrivacySub title="13.2. Atualizações desta Política e Canais Oficiais">
                <p>
                  Esta Política de Privacidade poderá ser aprimorada periodicamente para refletir mudanças legislativas ou evoluções na arquitetura do DoeCerto. Para dúvidas, requisições de direitos ou contato direto com nosso Encarregado de Dados (DPO), utilize os canais abaixo:
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block font-bold text-slate-900">Encarregado / DPO (LGPD)</span>
                    <span className="text-[#6B39A7] font-mono">privacidade@doecerto.net.br</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Segurança da Informação</span>
                    <span className="text-[#6B39A7] font-mono">seguranca@doecerto.net.br</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Autoridade Nacional (ANPD)</span>
                    <span className="text-slate-600 font-mono">gov.br/anpd</span>
                  </div>
                </div>
              </PrivacySub>
            </PrivacySection>
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
            <Link href="/terms" className="hover:text-[#6B39A7] transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="text-[#6B39A7] font-bold">
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

/* ── Componentes Auxiliares de Layout Privacidade DoeCerto Tech ── */

function PrivacySection({
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
          SEÇÃO {num}
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

function PrivacySub({
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

function PrivacyList({
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
