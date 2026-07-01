"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registra o plugin de scroll
gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  // Referências para capturar os elementos que vamos animar
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Cria uma timeline que dispara quando a seção entra na tela
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%", // A animação começa quando o topo da seção atinge 75% da altura da tela
        toggleActions: "play none none none",
      }
    });

    // 1. Anima a imagem vindo da esquerda para a direita
    tl.from(imageRef.current, {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, 0); // O '0' diz para começar no início da timeline

    // 2. Anima os filhos da div de texto (título e os dois parágrafos) subindo em cascata
    tl.from(textRef.current?.children || [], {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2, // Atraso de 0.2s entre cada elemento de texto
      ease: "power3.out"
    }, 0.2); // Começa 0.2s após o início da animação da imagem

  }, { scope: sectionRef });

  return (
    // Adicionamos o ref={sectionRef} aqui
    <section ref={sectionRef} className="bg-[#6B39A7] text-white pt-48 pb-40 -mt-10 relative z-10">

      <div className="container mx-auto px-32">
        <div className="flex flex-col lg:flex-row gap-24 items-center">

          {/* Coluna da Imagem na Esquerda */}
          {/* Adicionamos o ref={imageRef} aqui */}
          <div ref={imageRef} className="w-full lg:w-1/2">
            
              <img
                src="/image 1.png"
                alt="Como funciona"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            
          </div>

          <div ref={textRef} className="w-full lg:w-1/2 flex flex-col justify-center">
            {/* Adicionado font-['Poppins'] aqui */}
            <h2 className="font-['Poppins'] text-[64px] font-extrabold tracking-[-0.025em] leading-[0.95] mb-10 text-white">
              Como funciona o <br />
              DoeCerto?
            </h2>

            {/* Adicionado font-['Poppins'] aqui */}
            <div className="text-xl text-/85 space-y-6 font-['Poppins']">
              <p className="leading-relaxed font-light">
                Navegue por instituições <span className="font-medium text-white">rigorosamente verificadas</span>. e selecione a causa que alinha com seus valores. O processo é intuitivo, transparente e seguro, garantindo que cada doação seja direcionada para quem realmente precisa.
              </p>
              <p className="leading-relaxed font-light">
                Acompanhe o impacto com <span className="font-medium text-white">transparência total</span>, recebendo atualizações reais de <span className="font-medium text-white">onde sua doação está mudando vidas</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}