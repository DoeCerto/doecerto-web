"use client";
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function WhatIsDoeCerto() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    // 1. Estado inicial: Menor, bem embaçado e dentro de um círculo pequeno
    gsap.set(contentRef.current, {
      clipPath: "circle(5% at 50% 50%)",
      scale: 0.6, // Bem menor para o zoom ser dramático
      filter: "blur(25px)", // Embaçamento forte
      opacity: 0.2
    });

    // 2. Primeira Animação: SÓ O CÍRCULO (Rápido e no início)
    gsap.to(contentRef.current, {
      clipPath: "circle(150% at 50% 50%)",
      opacity: 0.5, // Fica visível, mas ainda não 100%
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 95%", // Começa assim que surge na tela
        end: "top 75%",   // Termina muito rápido (com 1 ou 2 toques no scroll)
        scrub: 0.5,
      }
    });

    // 3. Segunda Animação: SÓ O ZOOM E O FOCO (Contínuo e longo)
    gsap.to(contentRef.current, {
      scale: 1,
      filter: "blur(0px)",
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%", // Só começa DEPOIS que o círculo já abriu
        end: "center center", // Continua crescendo e focando até a seção chegar no meio da sua tela
        scrub: 0.5,
      }
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="pt-32 pb-48 bg-white text-gray-900 overflow-hidden rounded-b-[2rem] relative z-20 shadow-xl">
      <div ref={contentRef} className="container mx-auto px-32 origin-center">
        <div className="flex flex-col lg:flex-row gap-24 items-center">

          <div className="w-full lg:w-1/2">
            {/* Adicionado font-['Poppins'] aqui */}
            
           <h2 className="font-['Poppins'] font-extrabold text-[68px] tracking-[-0.025em] leading-[1] mb-8">
              {/* Parte superior do título isolada */}
              
                O que é <br />
               <span className="block bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent w-fit"> O DoeCerto?
              </span>
                 </h2>
            
            {/* Adicionado font-['Poppins'] aqui */}
            <div className="font-poppins text-xl text-gray-600 space-y-6">
  <p className="leading-relaxed font-light">
    Mais do que uma plataforma, somos a <span className="font-medium text-black">conexão direta</span> entre quem deseja transformar vidas e quem realmente precisa de apoio. Eliminamos a burocracia para que o foco seja apenas um: <span className="font-medium text-black">fazer o bem sem barreiras</span>.
  </p>
  <p className="leading-relaxed font-light">
    Tecnologia de ponta, <span className="font-medium text-black">verificação rigorosa</span> e <span className="font-medium text-black">total transparência</span> em cada centavo doado.
  </p>
</div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-[550px] rounded-[2rem] overflow-hidden shadow-2xl">
              <img src="/image 2.jpg" alt="Crianças" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}