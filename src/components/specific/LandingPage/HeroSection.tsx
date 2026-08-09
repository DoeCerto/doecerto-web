"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Download, Globe, Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const [showNav, setShowNav] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // ==========================================
  // O TRUQUE DO LENIS NO MOBILE
  // ==========================================
  useEffect(() => {
    const lenis = (window as any).lenis;
    
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = 'unset';
      if (lenis) lenis.start();
    }
    
    return () => { 
      document.body.style.overflow = 'unset'; 
      if ((window as any).lenis) (window as any).lenis.start();
    }
  }, [isMobileMenuOpen]);

  // ==========================================
  // CORREÇÃO DO SCROLL AO CARREGAR A PÁGINA COM #HASH
  // ==========================================
  // ==========================================
  // ROLAGEM SUAVE AO VIR DE OUTRA PÁGINA
  // ==========================================
  useEffect(() => {
    // 1. Desliga restauração nativa e trava no topo imediatamente
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. Procura pelo parâmetro '?section=' na URL (ao invés do #)
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const sectionId = params.get('section');
      
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          const lenis = (window as any).lenis;
          if (lenis) {
            // Rola suavemente usando o Lenis (duration 2 deixa bem cinematográfico)
            lenis.scrollTo(element, { offset: -100, duration: 2 });
          } else {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
        // Limpa a URL (remove o ?section=) para deixar o link bonito sem recarregar a página
        window.history.replaceState(null, '', window.location.pathname);
      }
    }, 500); // Aguarda meio segundo para a HeroSection fazer o fade-in antes de rolar

    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setShowNav(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // ==========================================
  // FUNÇÃO DE ROLAGEM LENIS
  // ==========================================
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const lenis = (window as any).lenis;
    
    if (lenis) {
      lenis.scrollTo(element, { offset: -100, duration: 1.5 });
    } else {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ==========================================
  // ANIMAÇÃO DE ENTRADA + PARALLAX GSAP
  // ==========================================
  useGSAP(() => {
    // 1. Animações de entrada (Fade in + Blur)
    gsap.from('.nav-anim', {
      y: -20, opacity: 0, filter: 'blur(8px)', duration: 1.8, stagger: 0.1, ease: 'power4.out',
    });
    gsap.from('.hero-anim', {
      y: 40, opacity: 0, filter: 'blur(12px)', duration: 2.2, stagger: 0.15, ease: 'power4.out', delay: 0.1
    });

    // 2. Timeline do Parallax (Scrub)
    if (!heroRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top", // Acaba quando a hero sair da tela
        scrub: true, // Sincronizado perfeitamente com o scroll
      }
    });

    // Camada 1: Imagem de fundo (Desce 20% criando o efeito de ficar para trás)
    tl.to('.parallax-layer-bg', { yPercent: 20, ease: "none" }, 0);
    
    // Camada 2: Textos principais (Sobe 10% criando um efeito pop-out e deslocamento)
    tl.to('.parallax-layer-content', { yPercent: -10, ease: "none" }, 0);

  }, { scope: heroRef });

  return (
    // IMPORTANTE: overflow-hidden garante que a imagem de fundo não vaze ao fazer o parallax
    <section ref={heroRef} className="relative w-full min-h-screen flex flex-col justify-end pt-32 pb-24 sm:pb-32 md:pb-40 lg:pb-48 overflow-hidden bg-black">

      {/* ========================================= */}
      {/* NAVBAR DESKTOP */}
      {/* ========================================= */}
      <nav className={`hidden md:block fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`relative container mx-auto px-8 lg:px-16 xl:px-32 flex items-center justify-between text-white transition-all duration-500 ${isScrolled ? 'pt-6 pb-4' : 'pt-10 pb-8'}`}>
          <div className="nav-anim">
            <button onClick={() => window.location.href = '/'} className="inline-block transition-transform duration-300 hover:scale-95 active:scale-90 cursor-pointer">
              <img src="/logo.svg" alt="DoeCerto" className="h-8 object-contain" />
            </button>
          </div>
          <div className="flex gap-8 font-medium">
            <div className="nav-anim"><button onClick={() => scrollToSection('whatisdoecerto')} className="nav-link-premium pb-1 drop-shadow-md block cursor-pointer">Quero conhecer</button></div>
            <div className="nav-anim"><button onClick={() => scrollToSection('verificationbadge')} className="nav-link-premium pb-1 drop-shadow-md block cursor-pointer">Saiba mais</button></div>
            <div className="nav-anim"><button onClick={() => scrollToSection('visitscarousel')} className="nav-link-premium pb-1 drop-shadow-md block cursor-pointer">Sobre nós</button></div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* HEADER MOBILE */}
      {/* ========================================= */}
      <header className={`md:hidden absolute top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-[50] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <button onClick={() => window.location.href = '/'} className="relative z-[50] p-2 -ml-2 active:scale-95 transition-transform cursor-pointer">
          <img src="/logo.svg" alt="DoeCerto" className="h-7 sm:h-8 object-contain" />
        </button>
      </header>

      {/* ========================================= */}
      {/* BOTÃO MOBILE FLUTUANTE */}
      {/* ========================================= */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] pointer-events-auto nav-anim">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-full shadow-2xl cursor-pointer ${
            isMobileMenuOpen
              ? 'bg-transparent border border-white/30 text-white/80 w-[140px] h-[48px]' 
              : 'bg-[#2A2A2A]/90 backdrop-blur-md border border-white/10 text-white w-[120px] h-[48px] hover:scale-105'
          }`}
        >
          <div className={`absolute flex items-center gap-2 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-0 -translate-y-6 rotate-12 scale-50' : 'opacity-100 translate-y-0 rotate-0 scale-100'}`}>
            <Menu size={20} className="text-white/80" />
            <span className="font-bold tracking-widest text-sm uppercase">Menu</span>
          </div>
          <div className={`absolute flex items-center gap-2 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-6 -rotate-12 scale-50'}`}>
            <X size={18} />
            <span className="font-bold tracking-widest text-sm uppercase">Close</span>
          </div>
        </button>
      </div>

      {/* ========================================= */}
      {/* MENU FULLSCREEN MOBILE */}
      {/* ========================================= */}
      <div className={`fixed inset-0 z-[100] bg-[#050505]/85 backdrop-blur-2xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden origin-bottom ${
        isMobileMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
      }`}>
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full flex justify-center z-20">
          <button 
            onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/'; }} 
            className="active:scale-95 transition-transform cursor-pointer"
          >
            <img src="/logo.svg" alt="DoeCerto" className="h-7 sm:h-8 object-contain drop-shadow-2xl" />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center w-full h-full overflow-y-auto px-8 pt-24 pb-28 relative z-10">
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-sm">
            <span className="text-[#a855f7] font-bold tracking-[0.3em] text-xs sm:text-sm uppercase mb-2">Menu</span>
            {[
              { label: "Quero conhecer", action: () => scrollToSection("whatisdoecerto") },
              { label: "Saiba mais", action: () => scrollToSection("verificationbadge") },
              { label: "Sobre nós", action: () => scrollToSection("visitscarousel") },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setTimeout(item.action, 300);
                }}
                className="text-[#EBEBEB] text-3xl sm:text-4xl font-black tracking-tighter uppercase hover:text-white active:scale-95 transition-transform cursor-pointer w-full text-center"
              >
                {item.label}
              </button>
            ))}
            <Link 
              href="/splash"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#EBEBEB] text-3xl sm:text-4xl font-black tracking-tighter uppercase hover:text-[#a855f7] active:scale-95 transition-colors cursor-pointer w-full text-center mt-2"
            >
              Fazer a diferença
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* IMAGENS E MÁSCARAS (CAMADA PARALLAX BG) */}
      {/* ========================================= */}
      <div className="parallax-layer-bg absolute inset-0 w-full h-[120%] -top-[10%] scale-110 z-0 will-change-transform">
        <img src="/fotocrianca.jpg" alt="Fundo" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 md:bg-black/20" />
      </div>

      {/* ========================================= */}
      {/* CONTEÚDO PRINCIPAL (CAMADA PARALLAX CONTENT) */}
      {/* ========================================= */}
      <div className="parallax-layer-content container mx-auto px-6 sm:px-8 md:px-16 lg:px-32 z-20 relative w-full flex-grow flex flex-col justify-end will-change-transform">
        <h1 className="hero-anim text-5xl sm:text-6xl md:text-[5rem] lg:text-7xl font-bold text-white leading-[1.1] md:leading-[0.95] tracking-tighter drop-shadow-md mb-8 md:mb-12">
          Sua doação <br />
          Ajuda <span className="relative inline-block px-2 md:px-4 mt-2 md:mt-0">
            <img src="/brush.svg" alt="" className="absolute inset-0 -z-10 w-full h-full object-contain scale-125 md:scale-150" />
            <span className="relative z-10 font-black">milhares</span>
          </span> <br />
          De vidas
        </h1>

        <div className="hero-anim flex flex-col sm:flex-row gap-4 w-full sm:w-max">
          <button className="w-full sm:w-auto justify-center bg-[#6B21A8] hover:bg-purple-900 transition-colors text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer">
            <Download size={20} />
            Baixar aplicativo
          </button>
          <Link href="/splash" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer">
            <Globe size={20} />
            Versão web
          </Link>
        </div>
      </div>

      {/* ========================================= */}
      {/* ONDA INFERIOR (Fica fixa na base, não sofre Parallax) */}
      {/* ========================================= */}
      <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none translate-y-1">
        <svg viewBox="0 0 1440 120" className="block w-full h-[60px] sm:h-[80px] md:h-[120px]" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,120 L0,70 C 280,0 750,140 1440,50 L1440,120 Z"></path>
        </svg>
      </div>
    </section>
  );
}