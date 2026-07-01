"use client";
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const visits = [
  { src: "/visita-1.jpg", name: "ONG CPFM" },
  { src: "/visita-2.jpg", name: "Associação Taekwondo Educativo" }, 
  { src: "/visita-3.jpg", name: "ONG CPFM" },
  { src: "/visita-4.jpg", name: "ONG Engrenagem que Funciona" },
];

export function VisitsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current;
    const cards = gsap.utils.toArray('.visit-card');
    
    if (track && cards.length > 0) {
      
      // Limpeza brutal para tirar qualquer sujeira de CSS que o cache salvou
      gsap.set([track, ...cards], { clearProps: "all" });

      const getScrollAmount = () => {
        const firstCard = cards[0] as HTMLElement;
        const lastCard = cards[cards.length - 1] as HTMLElement;
        let amount = lastCard.offsetLeft - firstCard.offsetLeft;

        // A MÁGICA ANTI-BUG ESTÁ AQUI:
        // Se a página voltar do cache e o navegador ainda não tiver renderizado o layout (retornando 0),
        // nós calculamos a largura exata na mão (Largura do Card + Gap) para o GSAP não quebrar a tela.
        if (!amount || amount <= 0) {
          const isDesktop = window.innerWidth >= 1024;
          const cardWidth = isDesktop ? 420 : 300;
          const gap = isDesktop ? 48 : 32;
          amount = (cardWidth + gap) * (cards.length - 1);
        }
        
        return amount;
      };

      const trackTween = gsap.fromTo(track, 
        { x: 0 }, 
        {
          x: () => -getScrollAmount(),
          ease: "none",
        }
      );

      ScrollTrigger.create({
        trigger: sectionRef.current,
        animation: trackTween,
        pin: true,
        pinSpacing: true,
        scrub: 1, 
        invalidateOnRefresh: true,
        end: () => `+=${getScrollAmount()}`, 
      });

      cards.forEach((card: any, index: number) => {
        const isLastCard = index === cards.length - 1;
        
        // FASE 1: Original e perfeita
        gsap.fromTo(card,
          { opacity: 0, scale: 0.8 }, 
          {
            opacity: 1, scale: 1.05, 
            ease: "power1.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: trackTween,
              start: "left 90%",  
              end: "center 55%", 
              scrub: true,
            }
          }
        );

        // FASE 2: Original e perfeita
        if (!isLastCard) {
          gsap.fromTo(card,
            { opacity: 1, scale: 1.05 }, 
            {
              opacity: 0, scale: 0.7, 
              ease: "power1.in",
              immediateRender: false, 
              scrollTrigger: {
                trigger: card,
                containerAnimation: trackTween,
                start: "center 55%", 
                end: "right 40%", 
                scrub: true,
              }
            }
          );
        }
      });

      gsap.fromTo(".reveal-content > *", 
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" }
        }
      );

      // Sincroniza o carrossel com a posição de scroll restaurada pelo navegador
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bg-[#572B8B] h-screen overflow-hidden font-poppins relative flex items-center">
      
      {/* TEXTO FLUTUANTE */}
      <div className="absolute left-0 top-0 w-full md:w-[45%] h-full z-30 flex flex-col justify-center pl-[10vw] pr-8 pointer-events-none">
        <div className="reveal-content pointer-events-auto drop-shadow-2xl">
          <h2 className="text-[48px] lg:text-[64px] font-extrabold text-white leading-[1.05] mb-6 uppercase tracking-tight">
            Conhecendo <br/> a Realidade
          </h2>
          <p className="leading-relaxed font-thin text-white/90 text-lg mb-8 max-w-[90%] drop-shadow-md">
            Das ruas às instituições. Acompanhe os registros das nossas visitas técnicas e veja de perto o <span className="font-medium text-white"> impacto social </span> que a sua doação ajuda a manter vivo.
          </p>
          <GlowButton />
        </div>
      </div>

      {/* ESTEIRA DE CARDS (O HTML que nós testamos e que para perfeitamente) */}
      <div className="w-full h-full relative z-10 flex items-center">
        <div 
          ref={trackRef} 
          className="absolute left-0 flex items-center gap-8 lg:gap-12 pl-[45vw] pr-[50vw] will-change-transform"
        >
          {visits.map((visit, index) => (
            <div 
              key={index} 
              className="visit-card relative w-[300px] lg:w-[420px] h-[55vh] lg:h-[65vh] rounded-[2rem] overflow-hidden shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gray-900">
                 <Image 
                  src={visit.src} 
                  alt={`Visita Técnica - ${visit.name}`} 
                  fill 
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center px-6 py-3 bg-[#111111]/80 backdrop-blur-md border border-white/20 rounded-2xl opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl w-max pointer-events-none z-30">
                <span className="text-white font-light text-sm tracking-widest uppercase">
                  {visit.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INDICADOR */}
      <div className="absolute bottom-11 left-0 w-full flex items-center justify-center gap-4 md:gap-6 pointer-events-none z-30 animate-pulse">
        <div className="h-[1px] w-12 md:w-22 bg-white/20"></div>
        <span className="text-white/80 text-[10px] md:text-xs font-light tracking-[0.3em] uppercase">
          Role para baixo
        </span>
        <div className="h-[0.2px] w-12 md:w-22 bg-white/20"></div>
      </div>

    </section>
  );
}

function GlowButton() {
  const divRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="mt-4 flex w-full justify-start -ml-2">
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex p-[1.5px] rounded-full overflow-hidden cursor-pointer group"
      >
        <div className="absolute inset-0 bg-white/15 rounded-full transition-opacity duration-500 group-hover:opacity-0" />
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(90px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.9), rgba(216, 180, 254, 0.3) 50%, transparent 100%)`,
          }}
        />
        <Link
          href="/login"
          className="relative flex items-center justify-center bg-[#2A114A] text-white font-semibold text-lg tracking-wide py-4 px-10 rounded-full z-10 transition-transform duration-300 group-active:scale-[0.98] w-full h-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          Quero transformar vidas
        </Link>
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-full transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(130px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.12), transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
}