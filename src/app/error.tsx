"use client";

import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#F9FAFB] lg:bg-white font-sans text-center px-6 overflow-hidden">
      <div className="w-20 h-20 rounded-2xl bg-[#4A2675]/10 text-[#4A2675] flex items-center justify-center mb-6">
        <AlertTriangle size={40} />
      </div>

      <h1 className="text-[2.25rem] sm:text-[2.75rem] font-bold text-gray-900 leading-tight mb-3 tracking-tight">
        Algo inesperado aconteceu
      </h1>

      <p className="text-gray-500 text-base sm:text-lg max-w-[520px] mb-8 font-medium leading-relaxed">
        Não foi possível carregar esta seção no momento. Seus dados estão seguros — tente recarregar ou volte para a página inicial.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center justify-center gap-2.5 bg-[#4A2675] hover:bg-[#3b1a66] text-white px-7 h-[56px] rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] cursor-pointer"
        >
          <RefreshCw size={20} />
          Tentar novamente
        </button>

        <Link
          href="/home"
          className="flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-[#4A2675] border border-[#4A2675]/25 px-7 h-[56px] rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98]"
        >
          <Home size={20} />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}

