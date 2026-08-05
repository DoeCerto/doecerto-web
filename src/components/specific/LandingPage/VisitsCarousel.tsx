"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowDown, Heart, HeartPulse } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// DADOS DAS VISITAS
// ==========================================
const visits = [
  { 
    id: "ong-cpfm",
    name: "ONG CPFM", 
    src: "/visita-1.jpg",
    description: "Uma visita transformadora onde conhecemos de perto a realidade e as necessidades diárias da instituição, focada em acolher e transformar o futuro de dezenas de famílias locais.",
    category: "Desenvolvimento social",
    impact: "20+ Famílias Atendidas"
  },
  { 
    id: "Associação Ponto Cidadão",
    name: "Associação Ponto Cidadão", 
    src: "/visita-6.jpg",
    description: "Entendemos as dores estruturais e as vitórias diárias dos professores voluntários que dedicam seu tempo para garantir reforço escolar e alimentação de qualidade.",
    category: "Educação infantil",
    impact: "Reforço Diário"
  },
  { 
    id: "engrenagem",
    name: "Associação Clube Sport Bonfim", 
    src: "/visita-5.jpg",
    description: "Mapeamos os processos de uma das instituições mais ativas da região, compreendendo como cada centavo doado se transforma em ações reais e impacto imediato.",
    category: "Esportes e lazer",
    impact: "Incentivo ao Esporte"
  },
];

/// ==========================================
// COMPONENTE: FLOW BUTTON (Reverso)
// ==========================================
function FlowButton({ text = "Quero apoiar" }: { text?: string }) {
  return (
    <button className="group/btn relative flex items-center justify-center gap-1 overflow-hidden rounded-[12px] border-[1.5px] border-transparent bg-transparent px-8 py-3 text-sm font-semibold text-white cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#6B39A7]/40 hover:text-[#6B39A7] hover:rounded-[100px] active:scale-[0.95] w-full sm:w-max">
      
      {/* Círculo expansivo do fundo (Inicia grande e encolhe no hover) */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#6B39A7] rounded-[50%] opacity-100 group-hover/btn:w-4 group-hover/btn:h-4 group-hover/btn:opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Coração: HeartPulse (Inicia visível na esquerda e sai no hover) */}
      <HeartPulse 
        className="absolute w-5 h-5 left-4 stroke-white fill-none z-[9] group-hover/btn:left-[-25%] group-hover/btn:stroke-[#6B39A7] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Texto - Inicia na direita para acomodar o HeartPulse e centraliza no hover */}
      <span className="relative z-[1] translate-x-4 group-hover/btn:-translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Coração: Heart (Inicia fora na direita e entra no hover) */}
      <Heart 
        className="absolute w-5 h-5 right-[-25%] stroke-white fill-none z-[9] group-hover/btn:right-4 group-hover/btn:stroke-[#6B39A7] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
  );
}

// ==========================================
// COMPONENTE: CARD MENOR DO RODAPÉ (Overview)
// ==========================================
function MinimalVisitCard({ visit }: { visit: typeof visits[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--reveal-x", `${String(x)}%`);
    card.style.setProperty("--reveal-y", `${String(y)}%`);
    setActive(true);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--reveal-x", `${String(x)}%`);
    card.style.setProperty("--reveal-y", `${String(y)}%`);
    setActive(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onMouseLeave={() => setActive(false)}
      className="group relative block w-full h-full bg-transparent overflow-hidden border border-zinc-200 hover:border-[#6B39A7]/30 transition-colors duration-700 rounded-xl"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-t-xl">
        <Image
          src={visit.src}
          alt={visit.name}
          fill
          className="object-cover grayscale opacity-90 transition-all duration-1000 ease-out"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div
          className="absolute inset-0 w-full h-full transition-all duration-1000 ease-out"
          style={{
            clipPath: `circle(${
              active ? "150%" : "0%"
            } at var(--reveal-x, 50%) var(--reveal-y, 50%))`,
            transition: "clip-path 2.8s cubic-bezier(0.15, 0.85, 0.35, 1)",
          }}
        >
          <Image
            src={visit.src}
            alt={visit.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-30 w-fit ${
            active
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <Link
            href="/login"
            className="block bg-white/95 backdrop-blur-md text-[#6B39A7] text-[10px] uppercase tracking-wider font-bold py-3 px-8 rounded-full shadow-xl hover:bg-gradient-to-r hover:from-[#6B39A7] hover:to-[#6B39A7] hover:text-white transition-all duration-300 cursor-pointer"
          >
            Ver detalhes
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 bg-white relative z-20 rounded-b-xl">
        <span className="text-[11px] text-[#6B39A7] font-semibold mb-3">
          {visit.category}
        </span>

        <h4 className="text-sm md:text-base font-bold text-zinc-900 mb-4 w-full line-clamp-2 transition-colors duration-500">
          {visit.name}
        </h4>

        <div className="flex items-center justify-center">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-500">
            {visit.impact}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: APRESENTAÇÃO INDIVIDUAL DA ONG
// ==========================================
function VisitHero({ visit, reversed = false }: { visit: typeof visits[0]; reversed?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const mask = section.querySelector<HTMLElement>(".color-mask");

      let progress = 0;

      if (window.innerWidth < 768) {
        const elementTop = rect.top;
        const startReveal = windowHeight;
        const endReveal = windowHeight * 0.25;
        const totalDistance = startReveal - endReveal;
        const currentDistance = startReveal - elementTop;
        progress = currentDistance / totalDistance;
      } else {
        if (rect.top <= 0) {
          const totalScrollableDistance = rect.height - windowHeight;
          if (totalScrollableDistance > 0) {
            progress = Math.abs(rect.top) / totalScrollableDistance;
          }
        }
      }

      progress = Math.min(Math.max(progress, 0), 1);

      if (mask) {
        if (window.innerWidth < 768) {
          mask.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
        } else {
          mask.style.clipPath = `inset(0 0 ${100 - progress * 100}% 0)`;
        }
      }

      const revealSteps = section.querySelectorAll(".reveal-step");
      revealSteps.forEach((step) => {
        const startProgress = parseFloat(step.getAttribute("data-progress") || "0");
        if (progress > startProgress) {
          step.classList.add("active");
        } else {
          step.classList.remove("active");
        }
      });
    };

    handleScroll();
    window.addEventListener("resize", handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-auto md:h-[200vh] w-full group">
      <div className="relative md:sticky md:top-0 md:left-0 w-full h-auto md:h-screen overflow-hidden bg-white">
        <div className="w-full h-auto md:h-full grid grid-cols-1 md:grid-cols-2">
          
          <div className={`relative w-full md:h-full flex items-center justify-center py-10 px-6 md:p-0 mx-auto ${reversed ? "md:order-2" : ""}`}>
            <div className="relative w-full max-w-[350px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[750px] aspect-[4/5] md:aspect-auto md:h-full overflow-hidden rounded-2xl md:rounded-none shadow-2xl md:shadow-none">
              
              <div className="absolute inset-0 w-full h-full flex justify-center bg-zinc-900">
                <Image
                  src={visit.src}
                  alt={visit.name}
                  fill
                  className="object-cover grayscale opacity-90 brightness-110" 
                  priority
                />
              </div>

              <div
                className="color-mask absolute inset-0 w-full h-full flex justify-center will-change-[clip-path]"
                style={{ clipPath: "inset(0 0 100% 0)" }}
              >
                <Image
                  src={visit.src}
                  alt={visit.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-center py-10 px-8 md:p-16 relative z-20 ${reversed ? "md:order-1" : ""}`}>
            <div className="max-w-md w-full flex flex-col gap-6 md:gap-10">
              
              <div
                className="reveal-step transition-all duration-1000 ease-out opacity-0 translate-y-12 [&.active]:opacity-100 [&.active]:translate-y-0"
                data-progress="0.2"
              >
                <span className="block text-sm text-[#6B39A7] font-semibold mb-3">
                  Visita técnica
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-3">
                  {visit.name}
                </h2>
              </div>

              <div
                className="reveal-step transition-all duration-1000 ease-out opacity-0 translate-y-12 [&.active]:opacity-100 [&.active]:translate-y-0"
                data-progress="0.4"
              >
                <p className="text-base md:text-lg leading-relaxed text-zinc-600 font-light text-left md:text-justify pt-6 border-t border-zinc-200">
                  {visit.description}
                </p>
              </div>

              <div
                className="reveal-step pt-4 transition-all duration-1000 ease-out opacity-0 translate-y-12 [&.active]:opacity-100 [&.active]:translate-y-0"
                data-progress="0.6"
              >
                <Link href="/login" className="w-full block sm:w-max">
                  {/* BOTÃO CORAÇÃO: Entrando a versão Flow com HeartCrack/HeartPulse */}
                  <FlowButton text="Quero apoiar" />
                </Link>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SEÇÃO PRINCIPAL COMPLETA
// ==========================================
export function VisitsCarousel() {
  const container = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!container.current || !introRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: introRef.current,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse",
      }
    });

    tl.fromTo(
      gsap.utils.toArray(".blur-word", introRef.current),
      { filter: "blur(24px)", opacity: 0, y: 50 },
      { filter: "blur(0px)", opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: "power3.out" }
    )
    .fromTo(
      ".intro-text",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.7" 
    )
    .fromTo(
      ".intro-btn",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.7"
    );

    gsap.fromTo(
      ".anime-card",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: "#final-collection",
          start: "top 80%",
        }
      }
    );

  }, { scope: container });

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const indicator = scrollIndicatorRef.current;
      const track = indicator?.parentElement;
      if (!indicator || !track) return;

      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      if (maxScroll <= 0) {
        track.style.display = "none";
        return;
      } else {
        track.style.display = "block";
      }

      const scrollPercentage = (Math.abs(scrollEl.scrollLeft) / maxScroll) * 100;
      indicator.style.left = `${scrollPercentage * 0.666}%`;
    };

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    const timeoutId = setTimeout(handleScroll, 100);
    window.addEventListener("resize", handleScroll);

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div ref={container} className="w-full bg-white selection:bg-[#6B39A7] selection:text-white font-['Poppins']">
      
      {/* INTRODUÇÃO */}
      <section 
        id="visitscarousel" 
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 py-20"
      >
        <div ref={introRef} className="flex flex-col items-center text-center w-full max-w-4xl z-10">
          
          <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] text-zinc-900 leading-[1.1] mb-6 tracking-tight">
            <span className="blur-word opacity-0 inline-block mr-2 md:mr-4">Conhecendo</span>
            <span className="blur-word opacity-0 inline-block mr-2 md:mr-4">a</span>
            <br className="hidden sm:block" />
            <span className="blur-word opacity-0 inline-block bg-gradient-to-r from-[#6B39A7] to-[#623FFE] bg-clip-text text-transparent pb-2">
              realidade
            </span>
          </h2>

          <p className="intro-text opacity-0 leading-relaxed font-light text-zinc-600 text-base md:text-lg xl:text-xl mb-10 max-w-[95%] sm:max-w-[85%]">
            Não ficamos apenas na teoria. Fomos a campo visitar diversas instituições para entender como operam e mapear suas maiores dores diárias. O objetivo? Construir um ecossistema <span className="font-semibold text-zinc-900">100% seguro e transparente</span>, garantindo que a sua doação chegue com confiança a quem mais precisa.
          </p>

          <div className="intro-btn opacity-0">
            <GlowButton />
          </div>
          
        </div>
      </section>

      {/* LISTA DE VISITAS */}
      <div className="w-full flex flex-col relative z-20">
        {visits.map((visit, index) => (
          <VisitHero 
            key={visit.id} 
            visit={visit} 
            reversed={index % 2 !== 0} 
          />
        ))}
      </div>

      {/* OVERVIEW / SUMMARY HORIZONTAL COLLECTION */}
      <div
        id="final-collection"
        className="bg-white w-full pt-16 pb-12 md:pt-24 md:pb-16 border-t border-zinc-100"
      >
        <div className="w-full max-w-7xl mx-auto px-6">
          
          <div className="flex items-end justify-between border-b border-zinc-200 pb-4 mb-8">
            <span className="text-xs font-bold text-[#6B39A7] block uppercase tracking-wider">
              Visão geral
            </span>
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-zinc-900 hover:text-[#6B39A7] transition-colors"
            >
              <span>Ver todas</span>
              <ArrowDown className="w-4 h-4 transition-transform -rotate-90 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-8 no-scrollbar snap-x snap-mandatory justify-start md:justify-center"
          >
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="anime-card group cursor-pointer w-[calc(85vw)] sm:w-[calc(50%-8px)] md:w-[300px] flex-shrink-0 snap-center opacity-0"
              >
                <MinimalVisitCard visit={visit} />
              </div>
            ))}
          </div>

          <div className="w-24 h-[3px] bg-zinc-100 mx-auto mt-4 rounded-full overflow-hidden relative">
            <div
              ref={scrollIndicatorRef}
              className="h-full bg-gradient-to-r from-[#6B39A7] to-[#623FFE] w-8 rounded-full absolute left-0 transition-all duration-75"
              style={{ left: "0%" }}
            />
          </div>
          
        </div>
      </div>

    </div>
  );
}

// ==========================================
// GLOW BUTTON (O Botão principal com glow na borda)
// ==========================================
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
    <div className="flex justify-center mt-4">
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex p-[1.5px] rounded-xl overflow-hidden cursor-pointer group shadow-xl"
      >
        <div className="absolute inset-0 bg-zinc-200 rounded-xl transition-opacity duration-500 group-hover:opacity-0" />
        
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, rgba(107, 57, 167, 0.9), rgba(98, 63, 254, 0.4) 50%, transparent 100%)`,
          }}
        />
        
        <Link
          href="/login"
          className="relative flex items-center justify-center gap-3 bg-[#6B39A7] text-white font-bold text-sm py-4 px-8 rounded-xl z-10 transition-transform duration-300 active:scale-[0.98] shadow-[0_4px_20px_rgba(107,57,167,0.2)] w-full sm:w-max group-hover:bg-[#572B8B]"
        >
          <span>Quero transformar vidas</span>
          <HeartPulse size={18} className="transition-transform duration-300 group-hover:scale-110" />
        </Link>
        
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(140px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.1), transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
}