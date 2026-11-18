"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<((time: number) => void) | null>(null);

  // 1. Sincronização Síncrona ANTES do Paint (Elimina 100% de qualquer flash do topo da tela)
  useIsomorphicLayoutEffect(() => {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (pathname === "/") {
      const savedYStr = sessionStorage.getItem("landingScrollPos");
      if (savedYStr) {
        const targetY = parseFloat(savedYStr);
        if (!isNaN(targetY)) {
          window.scrollTo({ top: targetY, left: 0, behavior: "instant" as ScrollBehavior });
        }
      } else if (!window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
    } else if (pathname === "/metodologia") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  // 2. Inicialização do Lenis e ScrollTrigger de forma imediata (sem timeouts)
  useEffect(() => {
    const isLanding = pathname === "/";
    const savedYStr = isLanding ? sessionStorage.getItem("landingScrollPos") : null;
    const targetY = savedYStr ? parseFloat(savedYStr) : null;

    // Consome e limpa a posição salva para não interferir em navegações futuras
    if (savedYStr) {
      sessionStorage.removeItem("landingScrollPos");
      sessionStorage.removeItem("restoreSection");
    }

    // Se mobile (<768px), não inicializa Lenis (usa scroll nativo com posição já restaurada)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (targetY !== null && !isNaN(targetY)) {
        window.scrollTo({ top: targetY, left: 0, behavior: "instant" as ScrollBehavior });
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

    // Posicionamento imediato sem animação/rolagem visível
    if (targetY !== null && !isNaN(targetY)) {
      lenis.scrollTo(targetY, { immediate: true });
    } else if (window.location.hash) {
      const targetEl = document.querySelector(window.location.hash);
      if (targetEl) {
        lenis.scrollTo(targetEl as HTMLElement, { offset: -60, immediate: true });
      }
    } else if (pathname === "/metodologia") {
      lenis.scrollTo(0, { immediate: true });
    } else {
      lenis.scrollTo(0, { immediate: true });
    }

    ScrollTrigger.refresh();

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