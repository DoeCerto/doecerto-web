"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function HeroSection() {
  const [showNav, setShowNav] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const heroRef = useRef(null);

  // Lógica da Navbar Smart
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);

      if (currentScrollY > lastScrollY && currentScrollY > 100) setShowNav(false);
      else setShowNav(true);

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Animações GSAP - O toque "Premium"
  useGSAP(() => {
    // 1. Navbar: Desce suavemente ganhando nitidez
    gsap.from('.nav-anim', {
      y: -20,
      opacity: 0,
      filter: 'blur(8px)', // O segredo da fluidez premium
      duration: 1.8,
      stagger: 0.1,
      ease: 'power4.out', 
    });

    // 2. Conteúdo Hero: Sobe como um suspiro, ganhando foco
    gsap.from('.hero-anim', {
      y: 40,
      opacity: 0,
      filter: 'blur(12px)', // Desfoque maior no título por ser maior
      duration: 2.2,
      stagger: 0.15,
      ease: 'power4.out',
      delay: 0.1 
    });
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="relative w-full h-[95vh] min-h-[700px] overflow-hidden">

      {/* Navbar Smart */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${showNav ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div
          className={`absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
        />

        <div className={`relative container mx-auto px-32 flex items-center justify-between text-white transition-all duration-500 ${isScrolled ? 'pt-10 pb-4' : 'py-8'
          }`}>
          
          <div className="nav-anim">
            <a href="/" className="inline-block transition-transform duration-300 hover:scale-95 active:scale-90 translate-y-[6px]">
              <img src="/logo.svg" alt="DoeCerto" className="h-8 object-contain" />
            </a>
          </div>

          <div className="flex gap-8 font-medium">
            <div className="nav-anim">
              <Link href="#quero-conhecer" className="nav-link-premium pb-1 drop-shadow-md block">
                Quero conhecer
              </Link>
            </div>
            <div className="nav-anim">
              <Link href="#saiba-mais" className="nav-link-premium pb-1 drop-shadow-md block">
                Saiba mais
              </Link>
            </div>
            <div className="nav-anim">
              <Link href="#sobre-nos" className="nav-link-premium pb-1 drop-shadow-md block">
                Sobre nós
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Imagem de Fundo */}
      <img src="/fotocrianca.jpg" alt="Criança" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-32 mt-64 z-20 relative">
        <h1 className="hero-anim text-7xl font-bold text-white leading-[0.9] tracking-tighter drop-shadow-md">
          Sua doação <br />
          Ajuda <span className="relative inline-block px-4">
            <img src="/brush.svg" alt="" className="absolute inset-0 -z-10 w-full h-full object-contain scale-125" />
            <span className="relative z-10 font-black">milhares</span>
          </span> <br />
          De vidas
        </h1>

        <div className="hero-anim flex gap-4 mt-10">
          <button className="bg-[#6B21A8] hover:bg-purple-900 transition-colors text-white font-bold py-4 px-8 rounded-2xl shadow-lg">Baixar aplicativo</button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-white font-bold py-4 px-8 rounded-2xl shadow-lg">Versão web</button>
        </div>
      </div>

      {/* Onda de Transição Suave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-[60px] md:h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,120 L0,70 C 280,0 750,140 1440,50 L1440,120 Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}