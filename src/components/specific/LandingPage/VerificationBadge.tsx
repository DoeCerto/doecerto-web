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
    <section ref={sectionRef} className="bg-white py-32 relative z-20">
      <div className="container mx-auto px-32">
        <div className="flex flex-col lg:flex-row gap-24 items-center">

          {/* Coluna da Esquerda: Textos */}
          <div ref={textRef} className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {/* Ajuste 1: Tag <p> com text-[14px] para ficar sutil e perfeitamente alinhado à esquerda */}
            <p className="block font-['Quicksand'] font-semi-bold text-[#434343] text-[14px] uppercase tracking-[0.28em] mb-5">
              Fique tranquilo
            </p>

            {/* Título com Gradiente */}
            <h2 className="font-['Poppins'] font-bold text-[56px] leading-[1.25] mb-8">
              {/* Parte superior do título isolada */}
              <span className="block bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent w-fit">
                Selo de <br />
                Verificação
              </span>
              
              {/* Ajuste 2: Linha flex para travar o alinhamento vertical do ícone com o texto */}
              <span className="flex items-center gap-0">
                <span className="bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent">
                  DoeCerto
                </span>
                <img 
                  src="/iconeselo.svg" 
                  alt="Selo" 
                  className="h-[95px] w-[95px] object-contain shrink-0" 
                />
              </span>
            </h2>

            {/* Parágrafos */}
            <div className="text-xl text-[#1E1E1E] space-y-6 font-['Poppins']">
              <p className="leading-relaxed font-light">
                Nossa equipe realiza uma curadoria rigorosa de todas as instituições cadastradas. Analisamos a documentação, o histórico de atuação e garantimos que <span className="font-medium text-black">sua ajuda chegue exatamente onde deve chegar</span>. Transparência e segurança são os pilares do nosso ecossistema.
              </p>
              <p className="leading-relaxed font-light">
                Ao visualizar este selo de autenticidade ao lado do nome de uma ONG, você tem a certeza absoluta de que está apoiando um projeto legítimo, auditado e verdadeiramente comprometido com a transformação social.
              </p>
            </div>

          </div>

          {/* Coluna da Direita: Ilustração 3D */}
          <div ref={imageRef} className="w-full lg:w-1/2 flex justify-center">
             <div className="relative w-full max-w-lg transition-transform duration-700 hover:scale-105">
                <img 
                  src="/selo-verificacao-ilustracao.svg" 
                  alt="Ilustração de Verificação" 
                  className="w-full h-auto object-contain"
                />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}