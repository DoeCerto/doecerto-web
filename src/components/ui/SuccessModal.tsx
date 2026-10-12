"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ArrowRight, Building2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  homePath?: string;
  onResetFlow: () => void;
}

export function SuccessModal({
  isOpen,
  title = "Doação Confirmada!",
  description,
  homePath = "/home",
  onResetFlow,
}: SuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/40 px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center border border-gray-100 shadow-2xl animate-scaleUp">
        
        <div className="flex items-center justify-center gap-3.5 mx-auto mb-6">
          
          <div className="relative w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100/60 p-3.5 shrink-0">
            <Image 
              src="/logo-icon.png" 
              alt="DoeCerto"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center justify-center text-purple-300 animate-pulse">
            <ArrowRight size={22} strokeWidth={3} />
          </div>

          <div className="relative w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200/80 text-gray-400 shrink-0">
            <Building2 size={26} strokeWidth={2} />
            
            {/* O Mini Badge de Check Verde */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
            </div>
          </div>

        </div>

        {/* Título */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {title}
        </h2>

        {/* Descrição Dinâmica */}
        {description && (
          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-medium px-1">
            {description}
          </p>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => router.push(homePath)}
            className="w-full bg-[#6B39A7] hover:bg-[#55278d] text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all text-base sm:text-lg"
          >
            Ir para o Início
          </button>
          
          <button
            onClick={onResetFlow}
            className="w-full bg-transparent text-slate-400 hover:text-slate-600 py-2.5 font-bold text-base transition-colors"
          >
            Fazer outra Doação
          </button>
        </div>
      </div>
    </div>
  );
}