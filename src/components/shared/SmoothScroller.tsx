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
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

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
      
      // A MÁGICA: Expõe o Lenis para o site inteiro usar!
      (window as any).lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      rafRef.current = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(rafRef.current);
      gsap.ticker.lagSmoothing(0);
    }, 100);

    return () => {
      clearTimeout(initTimer); 
      
      // Limpa a variável global quando o componente morrer
      delete (window as any).lenis;
      
      if (rafRef.current) gsap.ticker.remove(rafRef.current);
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