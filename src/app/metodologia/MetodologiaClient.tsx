"use client";

import { useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  HelpCircle, 
  Heart, 
  TrendingUp, 
  Layers, 
  ArrowRight,
  Calculator,
  Building2,
  FileCheck2,
  Clock,
  ExternalLink
} from "lucide-react";
import { CATEGORY_IMPACT_CONFIG, calculateImpact } from "@/utils/impactCalculator";
import { PublicImpactMetrics } from "@/services/metrics.service";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

interface MetodologiaClientProps {
  initialMetrics: PublicImpactMetrics;
}

export default function MetodologiaClient({ initialMetrics }: MetodologiaClientProps) {
  // Inicializado diretamente com os dados pré-renderizados no servidor (Zero flickering, Zero skeleton)
  const [metrics] = useState<PublicImpactMetrics>(initialMetrics);
  
  // Estado do simulador interativo
  const [simAmount, setSimAmount] = useState<number>(50);
  const [simCategory, setSimCategory] = useState<string>("Alimentação");

  const simulatedResult = calculateImpact({
    amount: simAmount,
    primaryCategoryName: simCategory,
    donationType: "monetary"
  });

  const categoriesList = Object.entries(CATEGORY_IMPACT_CONFIG);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-800 ${poppins.className}`}>
      
      {/* HEADER DE NAVEGAÇÃO */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar ao início</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <Link href="/" className="flex items-center">
              <img src="/logo-roxa.svg" alt="DoeCerto" className="h-6 object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              Fazer uma doação
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200/80 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-purple-600" />
            Padrão de Transparência DoeCerto
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Metodologia de Impacto Tangível
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            Como o DoeCerto audita, calcula e converte cada doação financeira ou material em métricas mensuráveis de transformação social.
          </p>

          {/* DADOS PÚBLICOS AUDITADOS EM TEMPO REAL (CARREGAMENTO INSTANTÂNEO NO SSR) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px]">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vidas Amparadas</span>
              <span className="text-2xl font-black text-purple-700">
                +{metrics.totalLivesImpacted.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px]">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Repasse Direto</span>
              <span className="text-2xl font-black text-slate-900">
                R$ {Math.round(metrics.totalMonetaryRaised).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px]">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Intermediação</span>
              <span className="text-2xl font-black text-emerald-600">0%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px]">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ONGs Auditadas</span>
              <span className="text-2xl font-black text-slate-900">
                {metrics.totalVerifiedOngs}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* 1. PREMISSA FUNDAMENTAL */}
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Premissa Fundamental</span>
              <h2 className="text-2xl font-bold text-slate-900">Por que o Impacto Tangível importa?</h2>
            </div>
          </div>

          <div className="space-y-4 text-slate-600 font-light text-base leading-relaxed">
            <p>
              Nas plataformas convencionais de arrecadação, o doador frequentemente se depara apenas com valores financeiros abstratos (por exemplo, <em>"R$ 50,00 transferidos"</em>), sem conseguir visualizar concretamente o que aquele recurso produz na prática.
            </p>
            <p>
              Criamos e desenvolvemos para o DoeCerto um <strong className="text-slate-800 font-medium">motor paramétrico de impacto social</strong>. Nosso objetivo é transformar cada ato de solidariedade em unidades reais e compreensíveis: refeições nutritivas servidas, animais resgatados e acolhidos, crianças com material escolar e famílias amparadas diretamente.
            </p>
          </div>
        </section>

        {/* 2. A REGRA DA CAUSA ÂNCORA */}
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Arquitetura de Dados</span>
              <h2 className="text-2xl font-bold text-slate-900">A Regra da Causa Âncora (Missão Central)</h2>
            </div>
          </div>

          <div className="space-y-4 text-slate-600 font-light text-base leading-relaxed">
            <p>
              Muitas ONGs desenvolvem projetos multidisciplinares. Por exemplo, uma instituição de acolhimento animal pode também distribuir alimentos e manter iniciativas educativas na comunidade.
            </p>
            <p>
              Para assegurar precisão técnica e eliminar cálculos dúbios, o DoeCerto exige no cadastro institucional a definição de uma <strong className="text-slate-800 font-medium">Causa Principal (Missão Âncora)</strong>. É essa causa estatutária central que ancora a tabela de custos operacionais e alimenta o motor de impacto no momento da doação.
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-700 flex items-start gap-3 mt-4">
              <CheckCircle2 size={20} className="text-purple-600 shrink-0 mt-0.5" />
              <span>
                As demais categorias secundárias permanecem ativas como filtros de busca e descoberta no catálogo, enquanto o cálculo de impacto é executado com fidelidade à missão declarada da instituição.
              </span>
            </div>
          </div>
        </section>

        {/* 3. SIMULADOR INTERATIVO (SEM EMOJIS, TOTALMENTE TECNOLÓGICO) */}
        <section className="bg-gradient-to-br from-purple-900 to-[#4c1d95] text-white p-8 sm:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Calculator size={14} /> Simulador em Tempo Real
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Experimente a fórmula na prática
            </h2>
            <p className="text-purple-200 text-sm font-light mb-8">
              Veja como o motor do DoeCerto calcula a equivalência de impacto de acordo com a causa institucional e o montante doado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Controles */}
            <div className="space-y-4 bg-white/10 p-6 rounded-2xl border border-white/15 backdrop-blur-sm">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Valor da Doação (R$)
                </label>
                <div className="flex gap-2 mb-3">
                  {[20, 30, 50, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSimAmount(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        simAmount === val ? "bg-white text-purple-900 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="5"
                  max="10000"
                  step="5"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white/90 text-slate-900 px-4 py-3 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Causa da ONG
                </label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full bg-white/90 text-slate-900 px-4 py-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                  {categoriesList.map(([cat]) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resultado do Cálculo */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-3">
                  Impacto Tangível Estimado
                </span>
                
                {/* Ícone Tecnológico SVG ao invés de emoji */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                    <CategoryImpactIcon category={simCategory} size={24} className="text-purple-700" />
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    ~{simulatedResult.units}
                  </div>
                </div>

                <p className="text-sm font-bold text-purple-900 mb-2">
                  {simulatedResult.unitLabel}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {simulatedResult.impactText}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                Fórmula: R$ {simAmount.toFixed(2)} ÷ R$ {CATEGORY_IMPACT_CONFIG[simCategory]?.costPerUnit.toFixed(2)} custo unitário
              </div>
            </div>
          </div>
        </section>

        {/* 4. TABELA DE BENCHMARKS DAS 12 CATEGORIAS (ÍCONES VETORIAIS TECNOLÓGICOS) */}
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Tabela Paramétrica Oficial</span>
              <h2 className="text-2xl font-bold text-slate-900">Custos Médios por Causa no DoeCerto</h2>
            </div>
          </div>

          <p className="text-slate-600 font-light text-base leading-relaxed mb-8">
            Os valores abaixo refletem os custos operacionais médios apurados junto às instituições auditadas para viabilizar cada unidade de benefício direto:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoriesList.map(([cat, config]) => (
              <div 
                key={cat}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/60">
                      <CategoryImpactIcon category={cat} size={20} className="text-purple-700" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{cat}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-purple-700 font-bold text-xs shrink-0 shadow-2xs font-mono">
                    R$ {config.costPerUnit.toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pl-1">
                  <div>
                    <strong className="text-slate-700">Unidade:</strong> {config.unitSingular}
                  </div>
                  <div>
                    <strong className="text-slate-700">Ação direta:</strong> {config.actionVerb} {config.timeScope}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. REPASSE 100% DIRETO (TAXA ZERO) */}
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Integridade Financeira</span>
              <h2 className="text-2xl font-bold text-slate-900">Repasse 100% Direto e Taxa Zero</h2>
            </div>
          </div>

          <div className="space-y-4 text-slate-600 font-light text-base leading-relaxed">
            <p>
              Diferente de intermediadores comerciais que retêm percentuais sobre as doações, o <strong className="text-slate-800 font-medium">DoeCerto opera com Taxa Zero de intermediação</strong>.
            </p>
            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Transferência Direta:</strong> O PIX é emitido utilizando a chave institucional e os dados bancários oficiais da própria ONG.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sem Retenção:</strong> Todo centavo doado chega integralmente aos cofres da instituição selecionada.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Comprovante Rastreável:</strong> O doador tem acesso imediato ao código de autenticação e histórico da transação em sua área logada.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 6. PROCESSO DE AUDITORIA E SELO DOECERTO */}
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center font-bold text-lg">
              5
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Critérios de Verificação</span>
              <h2 className="text-2xl font-bold text-slate-900">Como auditamos cada instituição</h2>
            </div>
          </div>

          <p className="text-slate-600 font-light text-base leading-relaxed mb-6">
            Para conquistar o Selo de Verificação DoeCerto e estar habilitada a receber doações pela plataforma, a entidade passa por 4 etapas rigorosas:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <Building2 size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1. Regularidade Fiscal & CNPJ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Checagem cadastral na Receita Federal, verificação de atividade econômica compatível e certidões negativas de débitos.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <FileCheck2 size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2. Estatuto & Diretoria Ativa</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Análise do estatuto social registrado em cartório e validação da ata de posse da diretoria vigente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3. Checagem Bancária Institucional</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A chave PIX e conta corrente obrigatoriamente devem pertencer ao CNPJ da própria ONG, vetando repasses para contas de pessoas físicas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <Clock size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">4. Verificação Presencial & Histórico</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspeção presencial da sede ou validação de registros de atuação, projetos realizados e impacto comunitário comprovado.
              </p>
            </div>
          </div>
        </section>

        {/* 7. SALVAGUARDA JURÍDICA E COMPLIANCE */}
        <section className="bg-slate-100/80 p-8 sm:p-10 rounded-[2rem] border border-slate-200 text-slate-700">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck size={20} className="text-purple-700" />
            Aviso de Conformidade Jurídica & Governança (Compliance)
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <p>
              As unidades de impacto social (tais como vidas amparadas, refeições garantidas, mudas preservadas ou animais acolhidos) apresentadas em toda a plataforma DoeCerto constituem <strong className="text-slate-800">estimativas paramétricas de equivalência social</strong> calculadas a partir de benchmarks operacionais médios apurados no setor.
            </p>
            <p>
              O objetivo dessas métricas é conferir transparência e tangibilidade pedagógica ao ato de doação. A alocação orçamentária detalhada e o cronograma de compras de insumos são de exclusiva responsabilidade da administração estatutária de cada organização sem fins lucrativos cadastrada e verificada.
            </p>
            <p>
              O DoeCerto atua como viabilizador tecnológico e ambiente seguro de auditoria, não exercendo custódia ou gestão discricionária dos recursos financeiros transferidos pelo doador à entidade.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="text-center py-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Pronto para apoiar com transparência total?
          </h3>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 font-light text-base">
            Conheça as instituições rigorosamente verificadas e acompanhe o impacto real gerado pela sua doação.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/home"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-base shadow-md shadow-purple-200 transition-all active:scale-95"
            >
              Explorar ONGs auditadas
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-base transition-all active:scale-95"
            >
              Cadastrar minha ONG
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER SIMPLES E ELEGANTE */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DoeCerto. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-purple-700 transition-colors">Termos de Uso</Link>
            <Link href="/privacy" className="hover:text-purple-700 transition-colors">Privacidade</Link>
            <Link href="/" className="hover:text-purple-700 transition-colors">Página Inicial</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
