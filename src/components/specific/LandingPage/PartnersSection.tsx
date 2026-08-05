"use client";

import { useRef } from "react";
import { CinematicLogoCloud } from "@/components/ui/cinematic-logo-cloud"; 
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal"; 

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const clients = [
  { 
    name: "IFPE", 
    src: "/IFLOGO.svg",
    className: "h-16 md:h-20 w-auto object-contain grayscale opacity-40 transition-all duration-300 pointer-events-none"
  },
  { 
    name: "CTEEN Igarassu", 
    src: "/CTEN_LOGO.svg",
    className: "h-16 md:h-20 w-auto object-contain grayscale opacity-40 transition-all duration-300 pointer-events-none"
  },
  { 
    name: "Hub Canoa Grande", 
    src: "/HUB LOGO.svg", 
    className: "h-16 md:h-20 w-auto object-contain grayscale opacity-40 transition-all duration-300 pointer-events-none"
  },
];

export function PartnersSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".partner-text-reveal",
      { 
        y: 30, 
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".partner-text-trigger", 
          start: "top 90%",
          toggleActions: "play none none reverse", 
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-white relative z-20 pt-8 pb-32 md:pt-16 md:pb-52 rounded-b-[2rem] shadow-xl"
    >
      <div className="w-full flex justify-center mb-10 md:mb-20 px-4">
        <h2 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-zinc-800 text-xl md:text-3xl font-extralight tracking-normal text-center">
          <span>Transformando ideias em</span>
          <DiaTextReveal
            text={[
              "experiências.",
              "realidade.",
              "impacto.",
              "resultados."
            ]}
            repeat={true}
            repeatDelay={0.4}
            duration={1.0}
            holdDuration={0.8}
            fixedWidth={false} 
            colors={["#c679c4", "#fa3d1d", "#ffb005"]} 
          />
        </h2>
      </div>

      <CinematicLogoCloud 
        clients={clients} 
        eyebrow={
          <span className="partner-text-trigger block overflow-hidden py-1">
            <span className="partner-text-reveal inline-block leading-[1.3] font-['Poppins'] font-semibold uppercase tracking-[0.15em] text-zinc-500 text-xs md:text-sm">
              Parceiros e instituições que apoiam a<br className="hidden lg:block"/> transformação digital no terceiro setor
            </span>
          </span>
        }
        description=""
        className="bg-transparent dark:bg-transparent !py-0" 
      />
    </section>
  );
}