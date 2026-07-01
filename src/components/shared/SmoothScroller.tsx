"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Usamos um useRef para segurar a função exata de update do GSAP
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Destrava qualquer CSS residual de imediato
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    // Dá 100ms de fôlego para o Next.js inicializar o Router sem dar o erro de "dispatched before initialization"
    const initTimer = setTimeout(() => {
      const lenis = new Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
        infinite: false,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      // Guardamos a função na Ref para termos certeza de remover a certa
      rafRef.current = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(rafRef.current);
      gsap.ticker.lagSmoothing(0);
    }, 100);

    // Limpeza Termonuclear Segura
    return () => {
      clearTimeout(initTimer); // Cancela se o usuário sair rápido demais
      
      if (rafRef.current) {
        gsap.ticker.remove(rafRef.current);
      }
      
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.clearScrollMemory();
    };
  }, [pathname]);

  return <>{children}</>;
}