"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function VerificationBadge() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%", 
        toggleActions: "play none none none", 
      }
    });

    tl.from(textRef.current?.children || [], {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    }, 0);

    tl.from(imageRef.current, {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, 0.2);

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="verificationbadge" className="bg-white py-16 md:py-24 lg:py-32 relative z-20">
      
      {/* Ajuste de padding lateral responsivo para evitar quebra no mobile */}
      <div className="container mx-auto px-6 md:px-16 lg:px-32">
        
        {/* Ajuste de gap responsivo */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

          {/* Coluna da Esquerda: Textos */}
          <div ref={textRef} className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {/* Tag responsiva (fonte menor no mobile) */}
            <p className="block font-['Quicksand'] font-semibold text-[#434343] text-xs md:text-[14px] uppercase tracking-[0.2em] md:tracking-[0.28em] mb-4 md:mb-5">
              Fique tranquilo
            </p>

            {/* Título responsivo: text-4xl mobile, text-5xl tablet, text-[56px] desktop */}
            <h2 className="font-['Poppins'] font-bold text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] lg:leading-[1.25] mb-6 md:mb-8">
              <span className="block bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent w-fit">
                Selo de <br />
                Verificação
              </span>
              
              <span className="flex items-center gap-2 lg:gap-0 mt-2 lg:mt-0">
                <span className="bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent">
                  DoeCerto
                </span>
                {/* Ícone responsivo: menor no mobile para não quebrar a linha */}
                <img 
                  src="/iconeselo.svg" 
                  alt="Selo" 
                  className="h-[48px] w-[48px] sm:h-[64px] sm:w-[64px] lg:h-[95px] lg:w-[95px] object-contain shrink-0" 
                />
              </span>
            </h2>

            {/* Parágrafos responsivos: text-base no mobile para melhor leitura */}
            <div className="text-base sm:text-lg lg:text-xl text-[#1E1E1E] space-y-4 md:space-y-6 font-['Poppins']">
              <p className="leading-relaxed font-light">
                Nossa equipe realiza uma curadoria rigorosa de todas as instituições cadastradas. Analisamos a documentação, o histórico de atuação e garantimos que <span className="font-medium text-black">sua ajuda chegue exatamente onde deve chegar</span>. Transparência e segurança são os pilares do nosso ecossistema.
              </p>
              <p className="leading-relaxed font-light">
                Ao visualizar este selo de autenticidade ao lado do nome de uma ONG, você tem a certeza absoluta de que está apoiando um projeto legítimo, auditado e verdadeiramente comprometido com a transformação social.
              </p>
            </div>

          </div>

          {/* Coluna da Direita: Ilustração 3D */}
          {/* Margem superior adicionada no mobile para afastar do texto */}
          <div ref={imageRef} className="w-full lg:w-1/2 flex justify-center mt-6 lg:mt-0">
             <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg transition-transform duration-700 hover:scale-105">
                <img 
                  src="/selo-verificacao-ilustracao.svg" 
                  alt="Ilustração de Verificação" 
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}