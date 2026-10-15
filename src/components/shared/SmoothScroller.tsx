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
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    const isLanding = pathname === "/";
    const targetHash = window.location.hash || (isLanding ? sessionStorage.getItem("restoreSection") : "") || "";

    // Se NÃO houver hash para restauração, força o topo imediatamente
    if (!targetHash) {
      window.scrollTo(0, 0);
    }

    const initTimer = setTimeout(() => {
      // Dispositivos mobile com largura menor que 768px
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        if (targetHash) {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "instant" });
            if (isLanding) sessionStorage.removeItem("restoreSection");
          }
        }
        return; 
      }

      const lenis = new Lenis({
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
        infinite: false,
      });
      
      lenisRef.current = lenis;
      (window as any).lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      rafRef.current = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(rafRef.current);
      gsap.ticker.lagSmoothing(0);

      // Tratamento de destino de scroll:
      if (targetHash) {
        const scrollToTarget = () => {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            lenis.scrollTo(targetEl as HTMLElement, { offset: -60, immediate: true });
            if (isLanding) sessionStorage.removeItem("restoreSection");
            return true;
          }
          return false;
        };

        if (!scrollToTarget()) {
          setTimeout(scrollToTarget, 100);
        }
      } else {
        lenis.scrollTo(0, { immediate: true });
      }

      ScrollTrigger.refresh();
    }, 50);

    const onHashChange = () => {
      if (window.location.hash && lenisRef.current) {
        const targetEl = document.querySelector(window.location.hash);
        if (targetEl) {
          lenisRef.current.scrollTo(targetEl as HTMLElement, { offset: -60, duration: 1.2 });
        }
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      clearTimeout(initTimer); 
      window.removeEventListener("hashchange", onHashChange);
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