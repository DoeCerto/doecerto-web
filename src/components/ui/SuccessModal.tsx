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
      <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-[420px] text-center border border-gray-100 animate-scaleUp">
        
        <div className="flex items-center justify-center gap-3 mx-auto mb-6">
          
          <div className="relative w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100/60 p-3 shrink-0">
            <Image 
              src="/logo-icon.png" 
              alt="DoeCerto"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center justify-center text-purple-300 animate-pulse">
            <ArrowRight size={20} strokeWidth={3} />
          </div>

          <div className="relative w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200/80 text-gray-400 shrink-0">
            <Building2 size={24} strokeWidth={2} />
            
            {/* O Mini Badge de Check Verde */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Check className="w-3 h-3 text-white" strokeWidth={4} />
            </div>
          </div>

        </div>

        {/* Título */}
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          {title}
        </h2>

        {/* Descrição Dinâmica */}
        {description && (
          <p className="text-sm md:text-base text-gray-500 mb-8 leading-relaxed font-medium px-2">
            {description}
          </p>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => router.push(homePath)}
            className="w-full bg-[#6B39A7] hover:bg-[#55278d] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all text-base"
          >
            Ir para o Início
          </button>
          
          <button
            onClick={onResetFlow}
            className="w-full bg-transparent text-gray-400 hover:text-gray-600 py-2 font-bold text-sm transition-colors"
          >
            Fazer outra Doação
          </button>
        </div>
      </div>
    </div>
  );
}