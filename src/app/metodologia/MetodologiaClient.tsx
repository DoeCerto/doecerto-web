"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Building2,
  FileCheck2,
  Clock
} from "lucide-react";
import { CATEGORY_IMPACT_CONFIG, calculateImpact } from "@/utils/impactCalculator";
import { PublicImpactMetrics } from "@/services/metrics.service";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";
import SmoothScroller from "@/components/shared/SmoothScroller";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

interface MetodologiaClientProps {
  initialMetrics: PublicImpactMetrics;
}

export default function MetodologiaClient({ initialMetrics }: MetodologiaClientProps) {
  // Inicializado diretamente com os dados pré-renderizados no servidor (SSR)
  const [metrics] = useState<PublicImpactMetrics>(initialMetrics);
  
  // Estado do simulador interativo
  const [simAmount, setSimAmount] = useState<number>(50);
  const [simCategory, setSimCategory] = useState<string>("Alimentação");

  // Referências para o GSAP
  const pageRef = useRef<HTMLDivElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const moneyRef = useRef<HTMLSpanElement>(null);
  const ongsRef = useRef<HTMLSpanElement>(null);
  const simUnitsRef = useRef<HTMLSpanElement>(null);
  const simObj = useRef({ val: 0 });

  const simulatedResult = calculateImpact({
    amount: simAmount,
    primaryCategoryName: simCategory,
    donationType: "monetary"
  });

  const categoriesList = Object.entries(CATEGORY_IMPACT_CONFIG);

  // Animação de contagem suave nos números do simulador
  useEffect(() => {
    gsap.to(simObj.current, {
      val: simulatedResult.units,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (simUnitsRef.current) {
          simUnitsRef.current.textContent = `~${Math.floor(simObj.current.val)}`;
        }
      }
    });
  }, [simulatedResult.units]);

  // Garante que a página de metodologia SEMPRE comece no topo (0, 0)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  // ANIMAÇÕES GSAP & SCROLLTRIGGER
  useGSAP(() => {
    // 1. Objeto de controle dos contadores numéricos
    const countersObj = { lives: 0, money: 0, ongs: 0 };

    const animateCounters = () => {
      gsap.killTweensOf(countersObj);
      countersObj.lives = 0;
      countersObj.money = 0;
      countersObj.ongs = 0;

      if (livesRef.current) livesRef.current.textContent = "+0";
      if (moneyRef.current) moneyRef.current.textContent = "R$ 0";
      if (ongsRef.current) ongsRef.current.textContent = "0";

      // Vidas Amparadas (0 -> target)
      gsap.to(countersObj, {
        lives: metrics.totalLivesImpacted,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          if (livesRef.current) {
            livesRef.current.textContent = `+${Math.floor(countersObj.lives).toLocaleString('pt-BR')}`;
          }
        }
      });

      // Repasse Direto (0 -> target)
      gsap.to(countersObj, {
        money: Math.round(metrics.totalMonetaryRaised),
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          if (moneyRef.current) {
            moneyRef.current.textContent = `R$ ${Math.floor(countersObj.money).toLocaleString('pt-BR')}`;
          }
        }
      });

      // ONGs Auditadas (0 -> target)
      gsap.to(countersObj, {
        ongs: metrics.totalVerifiedOngs,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          if (ongsRef.current) {
            ongsRef.current.textContent = `${Math.floor(countersObj.ongs)}`;
          }
        }
      });
    };

    // 2. Trigger Bidirecional: Dispara tanto ao abrir quanto ao rolar para cima ou para baixo
    if (statsGridRef.current) {
      ScrollTrigger.create({
        trigger: statsGridRef.current,
        start: "top 90%",
        end: "bottom top",
        onEnter: () => animateCounters(),
        onEnterBack: () => animateCounters(),
      });
    }

    // 3. Animações de Entrada da Hero
    const heroTl = gsap.timeline();
    heroTl.from(".anim-hero-badge", { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1);
    heroTl.from(".anim-hero-title", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.2);
    heroTl.from(".anim-hero-sub", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.35);
    heroTl.from(".anim-stat-card", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 0.45);

    // 4. Animação de Entrada dos Blocos de Conteúdo
    gsap.from(".anim-sec-1", {
      scrollTrigger: {
        trigger: ".anim-sec-1",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".anim-sec-2", {
      scrollTrigger: {
        trigger: ".anim-sec-2",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".anim-sim", {
      scrollTrigger: {
        trigger: ".anim-sim",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    // Seção 3 - Tabela de Benchmarks (Animação de bloco seguro)
    gsap.from(".anim-sec-3", {
      scrollTrigger: {
        trigger: ".anim-sec-3",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".anim-sec-5", {
      scrollTrigger: {
        trigger: ".anim-sec-5",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    // Seção 5 - Processo de Auditoria (Animação de bloco seguro)
    gsap.from(".anim-sec-audit", {
      scrollTrigger: {
        trigger: ".anim-sec-audit",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".anim-sec-7", {
      scrollTrigger: {
        trigger: ".anim-sec-7",
        start: "top 90%",
        toggleActions: "play none none none",
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });

    gsap.from(".anim-cta", {
      scrollTrigger: {
        trigger: ".anim-cta",
        start: "top 90%",
        toggleActions: "play none none none",
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });

  }, { scope: pageRef });

  return (
    <SmoothScroller>
      <div ref={pageRef} className={`min-h-screen bg-[#F8FAFC] text-slate-800 ${poppins.className}`}>
        
        {/* HEADER DE NAVEGAÇÃO */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/#whychooseus"
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
            <div className="anim-hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} className="text-purple-600" />
              Padrão de Transparência DoeCerto
            </div>

            <h1 className="anim-hero-title text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Metodologia de Impacto Tangível
            </h1>

            <p className="anim-hero-sub text-lg sm:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
              Como o DoeCerto audita, calcula e converte cada doação financeira ou material em métricas mensuráveis de transformação social.
            </p>

            {/* DADOS PÚBLICOS AUDITADOS COM ANIMAÇÃO BIDIRECIONAL DE CONTAGEM */}
            <div 
              ref={statsGridRef} 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-100"
            >
              <div className="anim-stat-card p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px] shadow-xs">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vidas Amparadas</span>
                <span ref={livesRef} className="text-2xl font-black text-purple-700 font-mono">
                  +{metrics.totalLivesImpacted.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="anim-stat-card p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px] shadow-xs">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Repasse Direto</span>
                <span ref={moneyRef} className="text-2xl font-black text-slate-900 font-mono">
                  R$ {Math.round(metrics.totalMonetaryRaised).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="anim-stat-card p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px] shadow-xs">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Intermediação</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">0%</span>
              </div>

              <div className="anim-stat-card p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-h-[84px] shadow-xs">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ONGs Auditadas</span>
                <span ref={ongsRef} className="text-2xl font-black text-slate-900 font-mono">
                  {metrics.totalVerifiedOngs}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">

          {/* 1. PREMISSA FUNDAMENTAL */}
          <section className="anim-sec-1 bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
          <section className="anim-sec-2 bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
          <section className="anim-sim bg-gradient-to-br from-purple-900 to-[#4c1d95] text-white p-8 sm:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
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

              {/* Resultado do Cálculo com Animação Numérica Suave */}
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
                    <div className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                      <span ref={simUnitsRef}>~{simulatedResult.units}</span>
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
          <section className="anim-sec-3 bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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

            <div className="anim-bench-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriesList.map(([cat, config]) => (
                <div 
                  key={cat}
                  className="anim-bench-card p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex flex-col justify-between"
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
          <section className="anim-sec-5 bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
          <section className="anim-sec-audit bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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

            <div className="anim-audit-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="anim-audit-card p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                  <Building2 size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">1. Regularidade Fiscal & CNPJ</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Checagem cadastral na Receita Federal, verificação de atividade econômica compatível e certidões negativas de débitos.
                </p>
              </div>

              <div className="anim-audit-card p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                  <FileCheck2 size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">2. Estatuto & Diretoria Ativa</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Análise do estatuto social registrado em cartório e validação da ata de posse da diretoria vigente.
                </p>
              </div>

              <div className="anim-audit-card p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">3. Checagem Bancária Institucional</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A chave PIX e conta corrente obrigatoriamente devem pertencer ao CNPJ da própria ONG, vetando repasses para contas de pessoas físicas.
                </p>
              </div>

              <div className="anim-audit-card p-5 rounded-2xl bg-slate-50 border border-slate-100">
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
          <section className="anim-sec-7 bg-slate-100/80 p-8 sm:p-10 rounded-[2rem] border border-slate-200 text-slate-700">
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
          <section className="anim-cta text-center py-8">
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
              <Link href="/#whychooseus" className="hover:text-purple-700 transition-colors">Página Inicial</Link>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroller>
  );
}
