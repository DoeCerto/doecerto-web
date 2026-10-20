"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  ShieldCheck,
  Scale,
  Users,
  Check,
  Wallet,
  Landmark,
  Sparkles
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
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const [metrics] = useState<PublicImpactMetrics>(initialMetrics);

  // Estados do Simulador de Repasse & Impacto DoeCerto
  const [donationValue, setDonationValue] = useState<number>(50);
  const [selectedCategory, setSelectedCategory] = useState<string>("Alimentação");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState<boolean>(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const amountDropdownRef = useRef<HTMLDivElement>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Regra de Repasse DoeCerto:
  // Se for microdoação (< R$ 5): Pix direto na chave da ONG, taxa bancária é R$ 0,00 (0%).
  // Se for >= R$ 5: Pix instantâneo, taxa da adquirente de R$ 0,99 deduzida na fonte.
  // DoeCerto retém R$ 0,00 em qualquer cenário.
  const isMicroDonation = donationValue < 5;
  const bankingFee = isMicroDonation ? 0 : 0.99;
  const netValueToOng = Math.max(0, donationValue - bankingFee);

  // Cálculo de Impacto Social Tangível
  const impactResult = calculateImpact({
    amount: netValueToOng,
    primaryCategoryName: selectedCategory,
    donationType: "monetary"
  });

  const categoriesList = Object.entries(CATEGORY_IMPACT_CONFIG);

  // Fecha os dropdowns ao clicar fora e retoma scroll suave do Lenis se necessário
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      let closed = false;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        closed = true;
      }
      if (amountDropdownRef.current && !amountDropdownRef.current.contains(event.target as Node)) {
        setIsAmountDropdownOpen(false);
        closed = true;
      }
      if (closed && typeof window !== "undefined") {
        (window as any).lenis?.start();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typeof window !== "undefined") {
        (window as any).lenis?.start();
      }
    };
  }, []);

  // Referências GSAP
  const pageRef = useRef<HTMLDivElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const moneyRef = useRef<HTMLSpanElement>(null);
  const ongsRef = useRef<HTMLSpanElement>(null);
  const simUnitsRef = useRef<HTMLSpanElement>(null);
  const simObj = useRef({ val: 0 });

  // Animação numérica no contador de impacto
  useEffect(() => {
    gsap.to(simObj.current, {
      val: impactResult.units,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        if (simUnitsRef.current) {
          simUnitsRef.current.textContent = `~${Math.floor(simObj.current.val)}`;
        }
      }
    });
  }, [impactResult.units]);

  // Garante scroll no topo ao carregar
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  // Animações GSAP de entrada fluidas com clearProps
  useGSAP(() => {
    let isInitialLoad = true;
    const countersObj = { lives: 0, money: 0, ongs: 0 };

    const resetCounters = () => {
      gsap.killTweensOf(countersObj);
      countersObj.lives = 0;
      countersObj.money = 0;
      countersObj.ongs = 0;
      if (livesRef.current) livesRef.current.textContent = "+0";
      if (moneyRef.current) moneyRef.current.textContent = "R$ 0";
      if (ongsRef.current) ongsRef.current.textContent = "0";
    };

    const animateCounters = () => {
      resetCounters();

      gsap.to(countersObj, {
        lives: metrics.totalLivesImpacted,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          if (livesRef.current) {
            livesRef.current.textContent = `+${Math.floor(countersObj.lives).toLocaleString('pt-BR')}`;
          }
        }
      });

      gsap.to(countersObj, {
        money: Math.round(metrics.totalMonetaryRaised),
        duration: 1.7,
        ease: "power2.out",
        onUpdate: () => {
          if (moneyRef.current) {
            moneyRef.current.textContent = `R$ ${Math.floor(countersObj.money).toLocaleString('pt-BR')}`;
          }
        }
      });

      gsap.to(countersObj, {
        ongs: metrics.totalVerifiedOngs,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => {
          if (ongsRef.current) {
            ongsRef.current.textContent = `${Math.floor(countersObj.ongs)}`;
          }
        }
      });
    };

    // Reanima os números sempre que o usuário chegar nos cards (rolando para baixo ou voltando para cima)
    if (statsGridRef.current) {
      ScrollTrigger.create({
        trigger: statsGridRef.current,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          if (!isInitialLoad) {
            animateCounters();
          }
        },
        onEnterBack: () => {
          if (!isInitialLoad) {
            animateCounters();
          }
        },
        onLeave: () => {
          if (!isInitialLoad) {
            resetCounters();
          }
        },
        onLeaveBack: () => {
          if (!isInitialLoad) {
            resetCounters();
          }
        },
      });
    }

    // Entrada fluida da Hero sequenciada passo a passo
    const heroTl = gsap.timeline();
    heroTl.fromTo(".anim-hero-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" },
      0.1
    );
    heroTl.fromTo(".anim-hero-sub",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" },
      0.25
    );
    heroTl.fromTo(".anim-card",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out", clearProps: "all" },
      0.35
    );
    // Os 4 cardzinhos de impacto aparecem estritamente DEPOIS dos cards de cima
    heroTl.fromTo(".anim-stat-card",
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.2,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
        onStart: () => {
          animateCounters();
        },
        onComplete: () => {
          isInitialLoad = false;
        }
      },
      ">-0.25"
    );

    // Entrada das seções seguintes ao rolar a página
    gsap.fromTo(".anim-sim-section",
      { y: 35, opacity: 0 },
      { scrollTrigger: { trigger: ".anim-sim-section", start: "top 85%" }, y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
    );
    gsap.fromTo(".anim-sec-bench",
      { y: 35, opacity: 0 },
      { scrollTrigger: { trigger: ".anim-sec-bench", start: "top 85%" }, y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
    );
    gsap.fromTo(".anim-sec-audit",
      { y: 35, opacity: 0 },
      { scrollTrigger: { trigger: ".anim-sec-audit", start: "top 85%" }, y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
    );
    gsap.fromTo(".anim-sec-faq",
      { y: 35, opacity: 0 },
      { scrollTrigger: { trigger: ".anim-sec-faq", start: "top 85%" }, y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
    );
    gsap.fromTo(".anim-cta",
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: ".anim-cta", start: "top 90%" }, y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" }
    );

  }, { scope: pageRef });

  const faqs = [
    {
      question: "O DoeCerto cobra comissão ou retém porcentagem das doações?",
      answer: "Não. A comissão retida pelo DoeCerto é de R$ 0,00 (0%). Todo o valor arrecadado é transferido diretamente para a instituição beneficiária. O DoeCerto atua exclusivamente como ponte tecnológica de validação, auditoria e prestação de contas."
    },
    {
      question: "Como funciona a divisão entre microdoações e o Pix Instantâneo?",
      answer: "Criamos uma política justa para não prejudicar pequenas contribuições: se alguém doar R$ 1, R$ 2 ou R$ 4, o Pix é feito direto para a chave da ONG sem nenhuma taxa (0%), com envio do comprovante. Para doações a partir de R$ 5 feitas por doadores cadastrados, geramos o Pix Dinâmico com confirmação em tempo real na tela, cuja tarifa bancária de processamento (~R$ 0,99) é descontada na fonte pela adquirente parceira."
    },
    {
      question: "O dinheiro da doação passa pela conta do DoeCerto?",
      answer: "Não. O DoeCerto não exerce custódia financeira. O dinheiro sai diretamente da conta do doador para a conta bancária vinculada ao CNPJ oficial da ONG cadastrada, evitando bitributação e garantindo máxima segurança jurídica."
    },
    {
      question: "Como as organizações são auditadas antes de receberem o Selo DoeCerto?",
      answer: "Cada entidade é verificada de forma contínua em quatro bases oficiais da Controladoria-Geral da União (CGU) e do Portal da Transparência: CEPIM (impedimentos de convênios), CEIS (empresas e entidades inidôneas), CNEP (Lei Anticorrupção) e CEAF (ficha limpa dos dirigentes estatutários). Se houver qualquer irregularidade superveniente, o selo é suspenso na hora."
    },
    {
      question: "Como o impacto social é calculado?",
      answer: "Nosso motor de cálculo utiliza tabelas paramétricas de custos operacionais médios apurados na causa âncora de cada instituição (como o custo médio de uma refeição nutritiva ou de um acolhimento veterinário). Assim, cada valor doado é traduzido em unidades concretas de benefício direto."
    },
    {
      question: "Qualquer ONG sem fins lucrativos pode participar?",
      answer: "Sim. O cadastro e a utilização do DoeCerto são 100% gratuitos para organizações sem fins lucrativos regularmente constituídas no Brasil com CNPJ ativo e aprovadas no nosso protocolo de auditoria e conformidade."
    }
  ];

  return (
    <SmoothScroller>
      <div ref={pageRef} className={`min-h-screen bg-white text-slate-900 ${poppins.className}`}>

        {/* NAVBAR COM IDENTIDADE DOECERTO */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Voltar ao início</span>
              </button>
              <div className="h-5 w-px bg-slate-200 hidden sm:block" />
              <Link
                href="/"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("landingScrollPos");
                    sessionStorage.removeItem("restoreSection");
                  }
                }}
                className="flex items-center"
              >
                <img src="/logo-roxa.svg" alt="DoeCerto" className="h-6 object-contain" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="px-5 py-2.5 rounded-full bg-[#6B39A7] hover:bg-[#582C8C] text-white font-semibold text-sm transition-all active:scale-95 shadow-xs"
              >
                Fazer uma doação
              </Link>
            </div>
          </div>
        </header>

        {/* HERO SECTION DE METODOLOGIA COM ESPAÇAMENTO RESPIRÁVEL */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center">

            <h1 className="anim-hero-title text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
              Metodologia transparente,<br className="hidden sm:inline" /> impacto direto na causa
            </h1>

            <p className="anim-hero-sub text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mb-14 sm:mb-20">
              No DoeCerto, não existem comissões ocultas ou saldo retido em intermediários. Conheça nossa estrutura de taxas justas, auditoria governamental e mensuração de impacto social.
            </p>

            {/* 3 CARDS DE TRANSPARÊNCIA COM ESPAÇO RESPIRÁVEL E ANIMAÇÃO GSAP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

              {/* Card 1 */}
              <div className="anim-card p-7 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/60 hover:border-purple-200 hover:bg-purple-50/10 transition-all flex flex-col justify-between min-h-[240px]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Taxa de adesão e mensalidade
                  </h3>
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight mb-3">
                    R$ 0,00
                  </div>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">
                    100% gratuito para as ONGs cadastrarem e divulgarem seus projetos, necessidades e campanhas.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="anim-card p-7 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/60 hover:border-purple-200 hover:bg-purple-50/10 transition-all flex flex-col justify-between min-h-[240px]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Processamento bancário do Pix
                  </h3>
                  <div className="text-4xl sm:text-5xl font-black text-[#6B39A7] font-mono tracking-tight mb-3">
                    0% a R$ 0,99
                  </div>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">
                    Microdoações (&lt; R$ 5) têm taxa zero no Pix direto. A partir de R$ 5, incide apenas a taxa de rede do gateway com confirmação na tela.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="anim-card p-7 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/60 hover:border-purple-200 hover:bg-purple-50/10 transition-all flex flex-col justify-between min-h-[240px]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Comissão retida pelo DoeCerto
                  </h3>
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight mb-3">
                    R$ 0,00
                  </div>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">
                    Zero porcentagem sobre doações. Todo o montante líquido é repassado integralmente para a conta bancária da ONG.
                  </p>
                </div>
              </div>

            </div>

            {/* DADOS PÚBLICOS AUDITADOS (APARECEM SEQUENCIADOS APÓS OS CARDS DE CIMA) */}
            <div
              ref={statsGridRef}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-100"
            >
              <div className="anim-stat-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 text-center shadow-2xs hover:border-purple-200 transition-all">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vidas Amparadas</span>
                <span ref={livesRef} className="text-2xl sm:text-3xl font-black text-[#6B39A7] font-mono">
                  +0
                </span>
              </div>

              <div className="anim-stat-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 text-center shadow-2xs hover:border-purple-200 transition-all">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Repasse Direto</span>
                <span ref={moneyRef} className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  R$ 0
                </span>
              </div>

              <div className="anim-stat-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 text-center shadow-2xs hover:border-purple-200 transition-all">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Comissão DoeCerto</span>
                <span className="text-2xl sm:text-3xl font-black text-[#6B39A7] font-mono">0%</span>
              </div>

              <div className="anim-stat-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 text-center shadow-2xs hover:border-purple-200 transition-all">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ONGs Auditadas</span>
                <span ref={ongsRef} className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  0
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* SIMULADOR DE TRANSPARÊNCIA E REPASSE NO ROXO SÓLIDO OFICIAL DO DOECERTO #6B39A7 (LAYOUT LIMPO, MODERNO E SEM AMADORISMO) */}
        <section className="anim-sim-section bg-[#6B39A7] text-white py-20 sm:py-28 relative">
          <div className="max-w-5xl mx-auto px-6">

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-center mb-16 sm:mb-20 text-white">
              Transparência de cada centavo
            </h2>

            {/* GRID DE DUAS COLUNAS BOLD E DIRETO NO FUNDO ROXO DOECERTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-start relative">

              {/* Divisor vertical */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />

              {/* Lado Esquerdo: Frase com seletores customizados e elegantes */}
              <div className="space-y-8 md:pr-12">

                <div className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                  <span className="block text-white/80 font-medium text-xl sm:text-3xl mb-3">
                    Para uma doação de
                  </span>

                  {/* Dropdown de Valor Customizado */}
                  <div ref={amountDropdownRef} className="relative inline-block mr-3 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAmountDropdownOpen(!isAmountDropdownOpen);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="appearance-none bg-white text-[#6B39A7] font-black text-2xl sm:text-4xl px-5 py-2 sm:px-6 sm:py-3 rounded-2xl cursor-pointer shadow-lg inline-flex items-center gap-3 hover:bg-purple-50 transition-all font-mono"
                    >
                      <span>R$ {donationValue}</span>
                      <ChevronDown
                        size={22}
                        className={`text-[#6B39A7] transition-transform duration-200 ${isAmountDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isAmountDropdownOpen && (
                      <div
                        data-lenis-prevent="true"
                        onMouseEnter={() => typeof window !== "undefined" && (window as any).lenis?.stop()}
                        onMouseLeave={() => typeof window !== "undefined" && (window as any).lenis?.start()}
                        onWheel={(e) => e.stopPropagation()}
                        className="absolute z-40 mt-2 w-48 bg-white text-slate-900 rounded-2xl shadow-2xl border border-purple-100 p-2 max-h-56 overflow-y-auto overscroll-contain"
                      >
                        {[10, 20, 50, 100, 250, 500, 1000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setDonationValue(val);
                              setIsAmountDropdownOpen(false);
                              if (typeof window !== "undefined") {
                                (window as any).lenis?.start();
                              }
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl text-left font-mono font-bold text-base transition-colors flex items-center justify-between cursor-pointer ${donationValue === val ? "bg-purple-100 text-[#6B39A7]" : "hover:bg-slate-50 text-slate-700"
                              }`}
                          >
                            <span>R$ {val}</span>
                            {donationValue === val && <Check size={16} className="text-[#6B39A7]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-white/80 font-medium text-xl sm:text-3xl block my-3">
                    destinada à causa de
                  </span>

                  {/* Dropdown de Causa Customizado com suporte nativo a scroll */}
                  <div ref={categoryDropdownRef} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                        setIsAmountDropdownOpen(false);
                      }}
                      className="appearance-none bg-white text-[#6B39A7] font-bold text-xl sm:text-3xl px-5 py-2 sm:px-6 sm:py-3 rounded-2xl cursor-pointer shadow-lg inline-flex items-center gap-3 hover:bg-purple-50 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0">
                        <CategoryImpactIcon category={selectedCategory} size={16} className="text-[#6B39A7]" />
                      </div>
                      <span>{selectedCategory}</span>
                      <ChevronDown
                        size={22}
                        className={`text-[#6B39A7] transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div
                        data-lenis-prevent="true"
                        onMouseEnter={() => typeof window !== "undefined" && (window as any).lenis?.stop()}
                        onMouseLeave={() => typeof window !== "undefined" && (window as any).lenis?.start()}
                        onWheel={(e) => e.stopPropagation()}
                        className="absolute z-40 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-purple-100 p-2 max-h-60 overflow-y-auto overscroll-contain"
                      >
                        {categoriesList.map(([cat]) => {
                          const isSelected = selectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat);
                                setIsCategoryDropdownOpen(false);
                                if (typeof window !== "undefined") {
                                  (window as any).lenis?.start();
                                }
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${isSelected ? "bg-purple-100 text-[#6B39A7] font-bold" : "hover:bg-slate-50 text-slate-700"
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-purple-200 text-[#6B39A7]" : "bg-slate-100 text-slate-500"}`}>
                                  <CategoryImpactIcon category={cat} size={14} />
                                </div>
                                <span>{cat}</span>
                              </div>
                              {isSelected && <Check size={16} className="text-[#6B39A7]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 text-xs sm:text-sm text-purple-200 space-y-1">
                  <p>• Microdoações (&lt; R$ 5): repassadas diretamente na chave Pix da ONG sem taxa (0%).</p>
                  <p>• Doações a partir de R$ 5: confirmação instantânea na tela com taxa bancária fixa de R$ 0,99.</p>
                </div>
              </div>

              {/* Lado Direito: O Repasse Financeiro + O Impacto Tangível */}
              <div className="space-y-6 md:pl-12 flex flex-col justify-between">
                <div>
                  <span className="block text-white/80 font-medium text-xl sm:text-3xl mb-2">
                    A ONG receberá
                  </span>

                  <div className="text-4xl sm:text-6xl font-black text-white tracking-tight font-mono mb-2">
                    R$ {netValueToOng.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <span className="block text-white/80 font-medium text-xl sm:text-3xl mb-8">
                    direto em sua conta bancária.
                  </span>

                  {/* Impacto Tangível Estimado */}
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                      Impacto Social Estimado
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      <span ref={simUnitsRef}>~{impactResult.units}</span> {impactResult.unitLabel}
                    </div>
                    <p className="text-xs text-purple-100 mt-1 font-normal leading-relaxed">
                      {impactResult.impactText}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 text-xs sm:text-sm text-purple-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>Tarifa bancária de liquidação:</span>
                    <strong className="font-mono text-white">{bankingFee > 0 ? `R$ ${bankingFee.toFixed(2)}` : "R$ 0,00 (Isento)"}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Comissão retida pelo DoeCerto:</span>
                    <strong className="font-mono text-emerald-300 font-bold">R$ 0,00 (0%)</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* TABELA PARAMÉTRICA DE IMPACTO POR CAUSA SOCIAL (PADRÃO FINTECH COMPACTO) */}
        <section className="anim-sec-bench py-20 sm:py-28 max-w-5xl mx-auto px-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[#6B39A7] uppercase tracking-wider block mb-2">
                Índice de Conversão Social
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] mb-3">
                Custos médios por causa no DoeCerto
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                Para assegurar transparência técnica e eliminar cálculos dúbios, nosso motor adota benchmarks operacionais médios apurados no terceiro setor:
              </p>
            </div>

            {/* Selo Informativo Fintech */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600 shrink-0 self-start md:self-end">
              <ShieldCheck size={16} className="text-[#6B39A7]" />
              <span>12 Causas Mapeadas</span>
            </div>
          </div>

          {/* Grid de 2 Colunas Estilo Tabela Financeira Minimalista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categoriesList.map(([cat, config]) => (
              <div
                key={cat}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B39A7] border border-purple-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CategoryImpactIcon category={cat} size={18} className="text-[#6B39A7]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#6B39A7] transition-colors truncate">
                      {cat}
                    </h4>
                    <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                      {config.unitSingular} {config.timeScope ? `• ${config.timeScope}` : ""}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200/90 font-mono font-bold text-xs text-[#6B39A7] shadow-2xs">
                    R$ {config.costPerUnit.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Nota de Governança e Compliance de Rodapé da Tabela */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
            <p>
              * As métricas representam estimativas paramétricas de equivalência social auditadas periodicamente.
            </p>
            <span className="font-mono text-slate-400">Motor de Impacto v2.4</span>
          </div>
        </section>

        {/* PROCESSO DE AUDITORIA E COMPLIANCE GOVERNAMENTAL (CGU) */}
        <section className="anim-sec-audit py-20 sm:py-28 max-w-5xl mx-auto px-6 border-b border-slate-100">
          <div className="mb-14 max-w-3xl">
            <span className="text-xs font-bold text-[#6B39A7] uppercase tracking-wider block mb-2">
              Auditoria Governamental Contínua
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
              Como auditamos cada instituição
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              O DoeCerto opera um motor de checagem automatizada conectado diretamente às bases oficiais da Controladoria-Geral da União (CGU) e do Portal da Transparência:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

            {/* Card CEPIM */}
            <div className="p-8 sm:p-9 rounded-3xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6B39A7] border border-purple-100 flex items-center justify-center shrink-0">
                    <FileText size={26} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/70 text-[#6B39A7] border border-purple-200/50">
                    Base CGU
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  CEPIM
                </h3>
                <span className="block text-sm font-bold text-[#6B39A7] mt-1">
                  Entidades Privadas Impedidas
                </span>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-4">
                  Identifica e bloqueia organizações proibidas de celebrar convênios públicos ou receber repasses governamentais devido a irregularidades em prestações de contas.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Varredura contínua oficial</span>
              </div>
            </div>

            {/* Card CEIS */}
            <div className="p-8 sm:p-9 rounded-3xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6B39A7] border border-purple-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={26} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/70 text-[#6B39A7] border border-purple-200/50">
                    Idoneidade
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  CEIS
                </h3>
                <span className="block text-sm font-bold text-[#6B39A7] mt-1">
                  Empresas e Entidades Inidôneas
                </span>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-4">
                  Varredura contínua contra declarações de inidoneidade e sanções restritivas aplicadas por órgãos públicos de todo o país decorrentes de infrações legais.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Consulta contínua de idoneidade</span>
              </div>
            </div>

            {/* Card CNEP */}
            <div className="p-8 sm:p-9 rounded-3xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6B39A7] border border-purple-100 flex items-center justify-center shrink-0">
                    <Scale size={26} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/70 text-[#6B39A7] border border-purple-200/50">
                    Lei 12.846/13
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  CNEP
                </h3>
                <span className="block text-sm font-bold text-[#6B39A7] mt-1">
                  Cadastro de Empresas Punidas
                </span>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-4">
                  Checagem contínua de condenações com base na Lei Anticorrupção por atos lesivos contra o patrimônio ou a administração pública nacional ou estrangeira.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Conformidade anticorrupção</span>
              </div>
            </div>

            {/* Card CEAF */}
            <div className="p-8 sm:p-9 rounded-3xl bg-slate-50/70 border border-slate-200/70 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6B39A7] border border-purple-100 flex items-center justify-center shrink-0">
                    <Users size={26} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/70 text-[#6B39A7] border border-purple-200/50">
                    Ficha Limpa
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  CEAF (CPF)
                </h3>
                <span className="block text-sm font-bold text-[#6B39A7] mt-1">
                  Ficha Limpa dos Administradores
                </span>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-4">
                  Cruzamento minucioso do CPF de todos os dirigentes estatutários e membros da diretoria para atestar ausência de sanções funcionais graves e inelegibilidade.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Auditoria de diretoria ativa</span>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO FAQ (ESTILO ELEGANTE EM 2 COLUNAS) */}
        <section className="anim-sec-faq py-20 sm:py-28 max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start">

            {/* Coluna da Esquerda: Título Grande */}
            <div className="md:col-span-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Perguntas<br />frequentes
              </h2>
            </div>

            {/* Coluna da Direita: Lista de Perguntas Clean */}
            <div className="md:col-span-8 divide-y divide-slate-200/80">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-6 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left gap-4 font-bold text-slate-900 hover:text-[#6B39A7] transition-colors cursor-pointer"
                    >
                      <span className="text-base sm:text-lg leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#6B39A7]" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-4 pr-6 text-sm sm:text-base text-slate-600 font-normal leading-relaxed animate-in fade-in duration-150">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* CTA FINAL MINIMALISTA COM IDENTIDADE DOECERTO */}
        <section className="anim-cta py-16 text-center border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-xl mx-auto px-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Pronto para arrecadar ou apoiar?
            </h3>
            <p className="text-slate-500 mb-8 font-normal text-sm sm:text-base">
              Conheça as instituições rigorosamente verificadas e acompanhe a prestação de contas com transparência total.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/home"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#6B39A7] hover:bg-[#582C8C] text-white font-semibold text-sm transition-all shadow-xs active:scale-95"
              >
                Explorar ONGs auditadas
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-purple-50/30 text-slate-700 border border-slate-300 hover:border-purple-300 font-medium text-sm transition-all active:scale-95"
              >
                Cadastrar minha ONG
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER CLEAN */}
        <footer className="border-t border-slate-100 bg-white py-10 text-center text-xs text-slate-400">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} DoeCerto. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-[#6B39A7] transition-colors">Termos de Uso</Link>
              <Link href="/privacy" className="hover:text-[#6B39A7] transition-colors">Privacidade</Link>
              <Link
                href="/"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("landingScrollPos");
                    sessionStorage.removeItem("restoreSection");
                  }
                }}
                className="hover:text-[#6B39A7] transition-colors"
              >
                Página Inicial
              </Link>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroller>
  );
}
