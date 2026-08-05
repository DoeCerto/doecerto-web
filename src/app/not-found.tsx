"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import errorAnimation from "@/assets/animations/Error-404.json"; 
import { Home } from "lucide-react";
import { useEffect } from "react";
import gsap from "gsap";

export default function NotFound() {
  
  useEffect(() => {
    // Animação suave de entrada para os elementos de texto e botão
    gsap.fromTo(
      ".animate-404",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#F9FAFB] lg:bg-white font-sans text-center px-6 overflow-hidden">
      
      {/* Container da Animação Lottie */}
      <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] flex items-center justify-center mb-0 sm:-mb-6 animate-404">
        <Lottie 
          animationData={errorAnimation} 
          loop={true} 
          autoplay={true}
        />
      </div>

      <div className="flex flex-col items-center z-10">
        {/* Textos de Erro Atualizados */}
        <h1 className="animate-404 text-[2.5rem] sm:text-[3rem] font-bold text-gray-900 leading-tight mb-4 tracking-tight">
          Ops! Saímos da rota.
        </h1>
        
        <p className="animate-404 text-gray-500 text-base sm:text-lg max-w-[520px] mb-10 font-medium leading-relaxed">
          A página que você procura não está mais aqui, mas ainda há muitas causas e ONGs precisando da sua ajuda no DoeCerto.
        </p>

        {/* Botão de Retorno (Padrão do Sistema) */}
        <Link 
          href="/home" 
          className="animate-404 flex items-center justify-center gap-3 bg-[#4A2675] hover:bg-[#3b1a66] text-white px-8 h-[60px] rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)]"
        >
          <Home size={22} />
          Voltar para Segurança
        </Link>
      </div>
      
    </div>
  );
}