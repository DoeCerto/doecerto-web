"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Heart, TrendingUp, ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      }
    });

    // 1. Usando fromTo para forçar o estado inicial e final (Adeus bug de opacidade!)
    tl.fromTo(".animate-header", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: "power3.out" }, 
      0
    );

    // 2. Mesma coisa para os cards
    tl.fromTo(".animate-card", 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power3.out" }, 
      0.2
    );

  }, { scope: sectionRef });

  const features = [
    {
      icon: <Zap className="w-6 h-6" strokeWidth={1.5} />,
      title: "Rápido e fácil",
      description: "Doe em segundos, de qualquer lugar a qualquer momento."
    },
    {
      icon: <Heart className="w-6 h-6" strokeWidth={1.5} />,
      title: "Impacto real",
      description: "Acompanhe como suas doações transformam vidas."
    },
    {
      icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} />,
      title: "Transparência",
      description: "Veja exatamente para onde vai cada centavo doado."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />,
      title: "Confiável",
      description: "Organizações verificadas e certificadas pela nossa equipe."
    }
  ];

  return (
    // Adicionei font-poppins aqui por garantia para manter a tipografia impecável
    <section ref={sectionRef} className="py-32 bg-[#F8FAFC] relative z-10 font-poppins">
      <div className="container mx-auto px-8 md:px-32">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="animate-header text-[40px] md:text-[48px] font-bold text-gray-900 leading-tight mb-6">
            Por que escolher o DoeCerto?
          </h2>
          <p className="animate-header text-xl text-gray-500 font-light">
            Tecnologia de ponta para tornar suas doações mais eficientes e impactantes.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              // A classe animate-card é o gatilho exclusivo do GSAP agora
              className="animate-card bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(107,57,167,0.12)] group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#6B39A7] group-hover:text-white">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}