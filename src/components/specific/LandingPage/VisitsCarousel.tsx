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
      gsap.set([track, ...cards], { clearProps: "all" });

      const getScrollAmount = () => {
        const firstCard = cards[0] as HTMLElement;
        const lastCard = cards[cards.length - 1] as HTMLElement;
        let amount = lastCard.offsetLeft - firstCard.offsetLeft;

        // Fallback anti-bug atualizado com os novos tamanhos responsivos
        if (!amount || amount <= 0) {
          const width = window.innerWidth;
          let cardWidth = 260, gap = 24; // Mobile base
          
          if (width >= 1024) { 
            cardWidth = 420; gap = 48; // Desktop (lg)
          } else if (width >= 768) { 
            cardWidth = 300; gap = 32; // Tablet (md)
          }
          
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

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="visitscarousel" className="bg-[#572B8B] h-[100dvh] overflow-hidden font-poppins relative flex items-center">
      
      {/* 
        TEXTO FLUTUANTE RESPONSIVO:
        No mobile fica no topo (top-0, h-[45%]).
        No desktop ocupa a lateral esquerda inteira.
      */}
      <div className="absolute left-0 top-12 md:top-0 w-full md:w-[45%] h-[40%] md:h-full z-30 flex flex-col justify-start md:justify-center px-6 md:pl-[10vw] md:pr-8 pointer-events-none">
        <div className="reveal-content pointer-events-auto drop-shadow-2xl">
          {/* Tipografia responsiva */}
          <h2 className="text-4xl md:text-[48px] lg:text-[64px] font-extrabold text-white leading-[1.1] md:leading-[1.05] mb-4 md:mb-6 uppercase tracking-tight">
            Conhecendo <br className="hidden md:block" /> a Realidade
          </h2>
          <p className="leading-relaxed font-thin text-white/90 text-sm md:text-lg mb-6 md:mb-8 md:max-w-[90%] drop-shadow-md">
            Das ruas às instituições. Acompanhe os registros das nossas visitas técnicas e veja de perto o <span className="font-medium text-white"> impacto social </span> que a sua doação ajuda a manter vivo.
          </p>
          <GlowButton />
        </div>
      </div>

      {/* ESTEIRA DE CARDS RESPONSIVA */}
      <div className="w-full h-full relative z-10 flex items-center md:items-center items-end pb-24 md:pb-0">
        <div 
          ref={trackRef} 
          className="absolute left-0 flex items-center gap-6 md:gap-8 lg:gap-12 pl-[6vw] md:pl-[45vw] pr-[50vw] will-change-transform"
        >
          {visits.map((visit, index) => (
            <div 
              key={index} 
              className="visit-card relative w-[260px] md:w-[300px] lg:w-[420px] h-[45vh] md:h-[55vh] lg:h-[65vh] rounded-3xl md:rounded-[2rem] overflow-hidden shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gray-900">
                 <Image 
                  src={visit.src} 
                  alt={`Visita Técnica - ${visit.name}`} 
                  fill 
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 md:group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Tag com o nome da ONG */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-[#111111]/80 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl opacity-100 md:opacity-0 md:translate-y-6 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 shadow-2xl w-max pointer-events-none z-30">
                <span className="text-white font-light text-[10px] md:text-sm tracking-widest uppercase">
                  {visit.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INDICADOR */}
      <div className="absolute bottom-6 md:bottom-11 left-0 w-full flex items-center justify-center gap-3 md:gap-6 pointer-events-none z-30 animate-pulse">
        <div className="h-[1px] w-8 md:w-12 lg:w-22 bg-white/30"></div>
        <span className="text-white/80 text-[9px] md:text-xs font-light tracking-[0.2em] md:tracking-[0.3em] uppercase">
          Deslize para ver mais
        </span>
        <div className="h-[1px] w-8 md:w-12 lg:w-22 bg-white/30"></div>
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
    <div className="mt-2 md:mt-4 flex w-max justify-start md:-ml-2">
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex p-[1.5px] rounded-full overflow-hidden cursor-pointer group"
      >
        <div className="absolute inset-0 bg-white/15 rounded-full transition-opacity duration-500 group-hover:opacity-0" />
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out hidden md:block"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(90px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.9), rgba(216, 180, 254, 0.3) 50%, transparent 100%)`,
          }}
        />
        <Link
          href="/login"
          className="relative flex items-center justify-center bg-[#2A114A] text-white font-semibold text-sm md:text-lg tracking-wide py-3 px-6 md:py-4 md:px-10 rounded-full z-10 transition-transform duration-300 active:scale-[0.98] w-full h-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          Quero transformar vidas
        </Link>
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-full transition-opacity duration-300 hidden md:block"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(130px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.12), transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
}