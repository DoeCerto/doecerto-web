"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, TrendingUp, ShieldCheck, Zap, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getPublicImpactMetrics, PublicImpactMetrics } from "@/services/metrics.service";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  // Referências diretas aos nós do DOM para contagem fluida 60fps
  const livesRef = useRef<HTMLSpanElement>(null);
  const moneyRef = useRef<HTMLSpanElement>(null);
  const ongsRef = useRef<HTMLSpanElement>(null);
  const donationsRef = useRef<HTMLSpanElement>(null);

  // Armazenamento em ref das métricas mais recentes e do objeto interpolador
  const metricsRef = useRef<PublicImpactMetrics | null>(null);
  const countersObj = useRef({ lives: 0, money: 0, ongs: 0, donations: 0 });

  // Função centralizada para animar contadores de 0 até o valor real
  const animateCounters = () => {
    const data = metricsRef.current;
    if (!data) return;

    gsap.killTweensOf(countersObj.current);
    countersObj.current.lives = 0;
    countersObj.current.money = 0;
    countersObj.current.ongs = 0;
    countersObj.current.donations = 0;

    if (livesRef.current) livesRef.current.textContent = "+0";
    if (moneyRef.current) moneyRef.current.textContent = "R$ 0";
    if (ongsRef.current) ongsRef.current.textContent = "0";
    if (donationsRef.current) donationsRef.current.textContent = "+0";

    // 1. Vidas Amparadas (0 -> target)
    gsap.to(countersObj.current, {
      lives: data.totalLivesImpacted,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        if (livesRef.current) {
          livesRef.current.textContent = `+${Math.floor(countersObj.current.lives).toLocaleString('pt-BR')}`;
        }
      }
    });

    // 2. Repasse Direto (0 -> target)
    gsap.to(countersObj.current, {
      money: Math.round(data.totalMonetaryRaised),
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        if (moneyRef.current) {
          moneyRef.current.textContent = `R$ ${Math.floor(countersObj.current.money).toLocaleString('pt-BR')}`;
        }
      }
    });

    // 3. ONGs Auditadas (0 -> target)
    gsap.to(countersObj.current, {
      ongs: data.totalVerifiedOngs,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        if (ongsRef.current) {
          ongsRef.current.textContent = `${Math.floor(countersObj.current.ongs)}`;
        }
      }
    });

    // 4. Total de Doações (0 -> target)
    gsap.to(countersObj.current, {
      donations: data.totalDonations,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        if (donationsRef.current) {
          donationsRef.current.textContent = `+${Math.floor(countersObj.current.donations).toLocaleString('pt-BR')}`;
        }
      }
    });
  };

  // Carrega métricas públicas da API
  useEffect(() => {
    let isMounted = true;
    getPublicImpactMetrics()
      .then((data) => {
        if (isMounted) {
          metricsRef.current = data;
          // Se o grid já estiver na viewport ao carregar os dados, dispara a contagem
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              animateCounters();
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP & ScrollTrigger Bidirecional (sobe e desce na tela)
  useGSAP(() => {
    // Gatilho Bidirecional: Dispara tanto ao descer (onEnter) quanto ao subir (onEnterBack)
    ScrollTrigger.create({
      trigger: cardsGridRef.current || sectionRef.current,
      start: "top 85%",
      end: "bottom top",
      onEnter: () => animateCounters(),
      onEnterBack: () => animateCounters(),
    });

    // Animação de entrada dos cabeçalhos
    gsap.fromTo(".animate-header", 
      { y: 30, opacity: 0 }, 
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.15, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );

    // Animação de entrada dos cards
    gsap.fromTo(".animate-card", 
      { y: 35, opacity: 0 }, 
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsGridRef.current || sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );

    // Rodapé de metodologia e transparência
    gsap.fromTo(".animate-footer",
      { y: 25, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".animate-footer",
          start: "top 95%",
          toggleActions: "play none none none"
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-[#F8FAFC] relative z-10 font-poppins" id="whychooseus">
      <div className="container mx-auto px-6 md:px-16 lg:px-32">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="animate-header text-[36px] md:text-[48px] font-bold text-gray-900 leading-tight mb-4">
            Por que escolher o DoeCerto?
          </h2>
          <p className="animate-header text-lg md:text-xl text-gray-500 font-light">
            Tecnologia de ponta e auditoria contínua para transformar sua solidariedade em impacto mensurável.
          </p>
        </div>

        {/* Grid dos 4 Cards Unificados com Contagem Bidirecional */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Card 1: Vidas Amparadas */}
          <div className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                <Heart className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 font-mono">
                <span ref={livesRef}>+0</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Impacto real auditado
              </h3>

              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Acompanhe em tempo real como suas doações se traduzem em vidas amparadas e refeições entregues.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#6B39A7] font-semibold">
              Auditado pela plataforma
            </div>
          </div>

          {/* Card 2: Repasse Direto (R$) */}
          <div className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 font-mono">
                <span ref={moneyRef}>R$ 0</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Transparência e taxa zero
              </h3>

              <p className="text-gray-500 font-light text-sm leading-relaxed">
                100% repassado via PIX diretamente para a conta da ONG selecionada, sem taxas de intermediação.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#6B39A7] font-semibold">
              Auditado pela plataforma
            </div>
          </div>

          {/* Card 3: Organizações Confiáveis */}
          <div className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 font-mono">
                <span ref={ongsRef}>0</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Organizações confiáveis
              </h3>

              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Entidades rigorosamente checadas com CNPJ ativo, estatuto social e histórico presencial aprovado.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#6B39A7] font-semibold">
              Auditado pela plataforma
            </div>
          </div>

          {/* Card 4: Total de Doações */}
          <div className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                <Zap className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 font-mono">
                <span ref={donationsRef}>+0</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Rápido e rastreável
              </h3>

              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Doe em segundos com geração imediata de comprovante digital e auditoria transparente do repasse.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#6B39A7] font-semibold">
              Auditado pela plataforma
            </div>
          </div>

        </div>

        {/* Barra de Transparência Tecnológica & Link para a Página de Metodologia */}
        <div className="animate-footer mt-12 bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center shrink-0 hidden sm:flex">
              <HelpCircle size={22} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Como calculamos e auditamos o impacto de cada doação?
              </h4>
              <p className="text-sm text-gray-500 font-light mt-0.5">
                Conheça os benchmarks operacionais, a regra da Causa Âncora e nossos critérios de auditoria.
              </p>
            </div>
          </div>

          <Link
            href="/metodologia"
            scroll={false}
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("landingScrollPos", window.scrollY.toString());
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            Conhecer a metodologia
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}