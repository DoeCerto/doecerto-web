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
      scale: 0.6, 
      filter: "blur(25px)", 
      opacity: 0.2
    });

    // 2. Primeira Animação: SÓ O CÍRCULO
    gsap.to(contentRef.current, {
      clipPath: "circle(150% at 50% 50%)",
      opacity: 0.5, 
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 95%", 
        end: "top 75%",  
        scrub: 0.5,
      }
    });

    // 3. Segunda Animação: SÓ O ZOOM E O FOCO
    gsap.to(contentRef.current, {
      scale: 1,
      filter: "blur(0px)",
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%", 
        end: "center center", 
        scrub: 0.5,
      }
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="whatisdoecerto" className="pt-16 sm:pt-24 md:pt-32 pb-24 md:pb-48 bg-white text-gray-900 overflow-hidden rounded-b-[2rem] relative z-20 shadow-xl">
      
      {/* Ajuste do padding lateral (px-6 mobile, px-16 tablet, px-32 desktop) */}
      <div ref={contentRef} className="container mx-auto px-6 md:px-16 lg:px-32 origin-center">
        
        {/* Ajuste do gap (menor no celular, maior no PC) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

          <div className="w-full lg:w-1/2">
            
            {/* Título responsivo: text-4xl mobile, text-5xl tablet, text-[68px] PC */}
            <h2 className="font-['Poppins'] font-extrabold text-4xl sm:text-5xl lg:text-[68px] tracking-tight lg:tracking-[-0.025em] leading-[1.1] lg:leading-[1] mb-6 md:mb-8 text-center lg:text-left">
              O que é <br className="hidden sm:block" />
              <span className="block lg:inline-block bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent w-full lg:w-fit mx-auto lg:mx-0"> 
                O DoeCerto?
              </span>
            </h2>
            
            {/* Parágrafos responsivos: text-base mobile, text-xl PC */}
            <div className="font-poppins text-base md:text-xl text-gray-600 space-y-4 md:space-y-6 text-center lg:text-left">
              <p className="leading-relaxed font-light">
                Mais do que uma plataforma, somos a <span className="font-medium text-black">conexão direta</span> entre quem deseja transformar vidas e quem realmente precisa de apoio. Eliminamos a burocracia para que o foco seja apenas um: <span className="font-medium text-black">fazer o bem sem barreiras</span>.
              </p>
              <p className="leading-relaxed font-light">
                Tecnologia de ponta, <span className="font-medium text-black">verificação rigorosa</span> e <span className="font-medium text-black">total transparência</span> em cada centavo doado.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            {/* Altura da imagem ajustada: h-[300px] mobile, h-[400px] tablet, h-[550px] PC */}
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[550px] rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-2xl">
              <img src="/image 2.jpg" alt="Crianças" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}