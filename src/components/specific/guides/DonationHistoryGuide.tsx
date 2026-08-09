"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Package,
  User,
  Heart,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Clock
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Acesse pelo",
    highlight: "menu rápido",
    description: "Clique na sua foto de perfil no canto superior direito e vá direto em 'Minhas Doações' para acessar seu histórico de forma instantânea.",
    mockup: <MockupCard1 />,
  },
  {
    id: 2,
    title: "Tudo em um",
    highlight: "só lugar",
    description: "Dentro do seu perfil, navegue até a aba 'Histórico' para visualizar todas as suas contribuições financeiras e envios de materiais.",
    mockup: <MockupCard2 />,
  },
  {
    id: 3,
    title: "Acompanhe o",
    highlight: "status",
    description: "Veja em tempo real se a sua doação financeira foi concluída ou se a entrega de materiais ainda está pendente de confirmação pela ONG.",
    mockup: <MockupCard3 />,
  },
];

export default function HistoryGuide() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  const callbackUrl = searchParams.get("from") || "/help-center";

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push(callbackUrl);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNavigation = () => {
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-[100dvh] w-full font-sans bg-[#F9FAFB] lg:bg-white overflow-hidden relative selection:bg-[#6B39A7] selection:text-white">
      
      <header className="absolute top-0 left-0 w-full p-6 sm:p-10 flex items-center justify-between z-50">
        <div className="w-1/3 flex justify-start">
          <button 
            onClick={handleNavigation} 
            className="flex items-center text-slate-500 hover:text-[#6B39A7] font-semibold transition-colors group w-fit active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>

        <div className="w-1/3 flex justify-center">
          <span className="text-[#6B39A7] font-extrabold tracking-widest text-xs sm:text-sm uppercase bg-purple-100 px-3 py-1 rounded-lg">
            {currentStep + 1} DE {STEPS.length}
          </span>
        </div>

        <div className="w-1/3 flex justify-end">
          <button
            onClick={handleNavigation}
            className="text-slate-400 hover:text-[#6B39A7] hover:bg-purple-50 px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-colors active:scale-95 cursor-pointer"
          >
            Pular
          </button>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 sm:px-12 pt-24 lg:pt-0 gap-12 lg:gap-20">
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
          
          <div className="w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] transition-all duration-300">
            {STEPS[currentStep].mockup}
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left pb-12 lg:pb-0">
          
          <div className="w-full max-w-[480px] min-h-[180px]">
            <h1 className="text-4xl sm:text-[3rem] font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
              {STEPS[currentStep].title} <br />
              <span className="text-[#6B39A7]">{STEPS[currentStep].highlight}</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
              {STEPS[currentStep].description}
            </p>
          </div>

          <div className="w-full max-w-[480px] flex items-center justify-between mt-4">
            
            <div className="w-20 flex justify-start">
              {currentStep > 0 ? (
                <button
                  onClick={handlePrev}
                  className="text-slate-400 hover:text-[#6B39A7] font-bold text-base transition-colors active:scale-95 cursor-pointer"
                >
                  Anterior
                </button>
              ) : (
                <div className="w-20"></div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentStep === idx
                      ? "w-8 bg-[#6B39A7]"
                      : "w-2.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="w-auto flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 bg-[#4A2675] hover:bg-[#3b1a66] text-white px-6 sm:px-8 h-[54px] sm:h-[60px] rounded-xl font-bold text-base sm:text-lg shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] transition-all active:scale-[0.98] group cursor-pointer"
              >
                {currentStep === STEPS.length - 1 ? "Começar" : "Próximo"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}

function MockupCard1() {
  return (
    <div className="flex flex-col items-center sm:items-end w-full select-none sm:pl-10">
      <div className="bg-white border border-slate-200 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-sm mb-4">
        <ChevronDown size={16} className="text-purple-700 rotate-180" />
        <span className="font-bold text-sm text-purple-700">João Silva</span>
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <User size={16} className="text-purple-700" />
        </div>
      </div>

      <div className="w-full sm:w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 p-3 rounded-xl opacity-50">
          <User size={18} className="text-slate-500" />
          <span className="font-bold text-slate-500">Meu Perfil</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl animate-pulse pointer-events-none"></div>
          <Heart size={18} className="text-rose-500" />
          <span className="font-bold text-slate-700">Minhas Doações</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl opacity-50">
          <HelpCircle size={18} className="text-slate-500" />
          <span className="font-bold text-slate-500">Central de Ajuda</span>
        </div>
      </div>
    </div>
  );
}

function MockupCard2() {
  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl w-full relative overflow-hidden select-none">
      
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-3 shadow-sm border-2 border-white">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">João Silva</h3>
        <p className="text-sm text-slate-500 font-medium">joao@email.com</p>
      </div>

      <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm mb-6 w-full border border-slate-100">
        <div className="flex-1 py-2 rounded-lg font-semibold text-center text-slate-400 text-sm">
          Informações
        </div>
        <div className="flex-1 py-2 rounded-lg font-semibold text-center bg-purple-600 text-white shadow-sm text-sm relative">
          Histórico
          <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl animate-pulse pointer-events-none"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-full relative opacity-80">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign size={18} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">SOS Gatinhos</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Calendar size={12} /> Ontem
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-xs font-medium text-slate-500">Doação Monetária</span>
          <span className="text-sm font-black text-emerald-600">R$ 50,00</span>
        </div>
      </div>
    </div>
  );
}

function MockupCard3() {
  return (
    <div className="flex flex-col gap-4 w-full select-none">
      
      <div className="bg-white rounded-[2rem] shadow-xl w-full border border-slate-100 p-5 sm:p-6 flex flex-col relative">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div className="bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm animate-pulse border border-yellow-200 flex items-center gap-1">
            <Clock size={12} /> Pendente
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-black text-slate-900">Instituto Crescer</h3>
          <p className="text-sm text-slate-500 font-medium">Doação de Materiais</p>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Aguardando a confirmação de entrega dos itens na sede da ONG.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm w-full border border-slate-200 p-5 sm:p-6 flex flex-col opacity-60">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 size={12} /> Concluída
          </div>
        </div>
        
        <div>
          <h3 className="font-black text-slate-900">SOS Gatinhos</h3>
          <p className="text-sm text-slate-500 font-medium mb-3">Doação Monetária</p>
        </div>
        
        <div className="flex items-center justify-between bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
          <span className="text-sm text-emerald-700 font-bold">Valor doado</span>
          <span className="font-black text-emerald-700">R$ 50,00</span>
        </div>
      </div>

    </div>
  );
}