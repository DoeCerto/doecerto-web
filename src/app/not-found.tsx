"use client";

import Link from "next/link";
import Lottie from "lottie-react";
// Lembre-se de ajustar o nome do arquivo JSON para o seu
import errorAnimation from "@/assets/animations/Error-404.json"; 

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-sans text-center px-6">
      
      {/* Container da Animação Lottie */}
      <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] flex items-center justify-center mb-4">
        <Lottie 
          animationData={errorAnimation} 
          loop={true} 
          autoplay={true}
        />
      </div>

      {/* Textos de Erro */}
      <h1 className="text-[2.5rem] sm:text-[3.5rem] font-black text-[#6B39A7] leading-tight mb-4">
        Ops! Página não encontrada.
      </h1>
      
      <p className="text-slate-500 text-base sm:text-lg max-w-[500px] mb-10 font-medium">
        A página que você está procurando pode ter sido removida, mudado de nome ou está temporariamente indisponível.
      </p>

      {/* Botão de Retorno com Interações */}
      <Link 
        href="/home" 
        className="bg-[#6B39A7] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#5a2e8c] hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(107,57,167,0.4)] transition-all duration-300 active:scale-95 uppercase tracking-wider"
      >
        Voltar para o Início
      </Link>
      
    </div>
  );
}