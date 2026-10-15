"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, TrendingUp, ShieldCheck, Zap, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getPublicImpactMetrics, PublicImpactMetrics } from "@/services/metrics.service";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Hook para contagem animada fluida
function useCountUp(target: number, duration: number = 1800, startNow: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startNow || target <= 0) {
      setCount(target);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, startNow]);

  return count;
}

export function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const [metrics, setMetrics] = useState<PublicImpactMetrics | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getPublicImpactMetrics()
      .then((data) => {
        if (isMounted) setMetrics(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
        onEnter: () => setIsCounting(true),
      }
    });

    tl.fromTo(".animate-header", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: "power3.out" }, 
      0
    );

    tl.fromTo(".animate-card", 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power3.out" }, 
      0.2
    );

    tl.fromTo(".animate-footer",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      0.6
    );

  }, { scope: sectionRef });

  // Valores reais vindos da API
  const rawLives = metrics?.totalLivesImpacted ?? 0;
  const rawMonetary = metrics ? Math.round(metrics.totalMonetaryRaised) : 0;
  const rawOngs = metrics?.totalVerifiedOngs ?? 0;
  const rawDonations = metrics?.totalDonations ?? 0;

  const countLives = useCountUp(rawLives, 1800, isCounting && metrics !== null);
  const countMonetary = useCountUp(rawMonetary, 2000, isCounting && metrics !== null);
  const countOngs = useCountUp(rawOngs, 1400, isCounting && metrics !== null);
  const countDonations = useCountUp(rawDonations, 1600, isCounting && metrics !== null);

  const features = [
    {
      icon: <Heart className="w-6 h-6" strokeWidth={1.5} />,
      metric: `+${countLives.toLocaleString('pt-BR')}`,
      title: "Impacto real auditado",
      description: "Acompanhe em tempo real como suas doações se traduzem em vidas amparadas e refeições entregues."
    },
    {
      icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} />,
      metric: `R$ ${countMonetary.toLocaleString('pt-BR')}`,
      title: "Transparência e taxa zero",
      description: "100% repassado via PIX diretamente para a conta da ONG selecionada, sem taxas de intermediação."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />,
      metric: `${countOngs}`,
      title: "Organizações confiáveis",
      description: "Entidades rigorosamente checadas com CNPJ ativo, estatuto social e histórico presencial aprovado."
    },
    {
      icon: <Zap className="w-6 h-6" strokeWidth={1.5} />,
      metric: `+${countDonations.toLocaleString('pt-BR')}`,
      title: "Rápido e rastreável",
      description: "Doe em segundos com geração imediata de comprovante digital e auditoria transparente do repasse."
    }
  ];

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

        {/* Grid dos 4 Cards Unificados (Estética Clean & Tecnológica) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                  {feature.icon}
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  {feature.metric}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 font-light text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#6B39A7] font-semibold">
                Auditado pela plataforma
              </div>
            </div>
          ))}
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