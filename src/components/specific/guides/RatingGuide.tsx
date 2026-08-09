"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Search,
  Heart,
  Star,
  ShieldCheck,
  AlertCircle,
  Banknote,
  Package,
  Send
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Encontre uma",
    highlight: "causa",
    description: "Navegue pela tela principal, utilize os filtros de categorias ou a barra de pesquisa para encontrar a ONG que você deseja apoiar.",
    mockup: <MockupCard1 />,
  },
  {
    id: 2,
    title: "Realize uma",
    highlight: "doação",
    description: "O direito de avaliar é exclusivo para doadores. Escolha entre fazer uma contribuição financeira via Pix ou doar materiais.",
    mockup: <MockupCard2 />,
  },
  {
    id: 3,
    title: "Deixe sua",
    highlight: "avaliação",
    description: "Após concluir a doação, volte ao perfil da ONG. O botão 'Avaliar ONG' estará liberado para você compartilhar sua experiência.",
    mockup: <MockupCard3 />,
  },
  {
    id: 4,
    title: "Transparência",
    highlight: "contínua",
    description: "Para manter as avaliações sempre atualizadas e fiéis à realidade, se você quiser avaliar a mesma ONG novamente no futuro, será necessário realizar uma nova doação.",
    mockup: <MockupCard4 />,
  },
];

export default function RatingGuide() {
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
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 via-blue-50/50 to-transparent rounded-full blur-3xl w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
          
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
                {currentStep === STEPS.length - 1 ? "Entendi" : "Próximo"}
                {currentStep === STEPS.length - 1 ? <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}

// MOCKUPS VISUAIS

function MockupCard1() {
  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl w-full relative overflow-hidden select-none">
      <div className="relative mb-5 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-purple-500" />
        </div>
        <div className="w-full pl-10 pr-4 py-3 bg-white border-2 border-purple-300 rounded-xl text-slate-800 text-sm font-bold shadow-sm flex items-center animate-pulse">
          Apoiar educação infantil
        </div>
      </div>

      <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        <div className="w-full aspect-[21/9] bg-slate-100 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
            alt="Crianças" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex flex-col">
          <span className="text-purple-600 text-[10px] font-bold tracking-wide uppercase mb-1">Educação</span>
          <h3 className="text-base font-extrabold text-slate-900 mb-2">Inst. Sementes do Futuro</h3>
          <div className="w-full bg-slate-100 text-slate-500 rounded-lg py-2.5 text-xs font-bold text-center">
            Acessar Perfil
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupCard2() {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl w-full border border-slate-100 px-6 py-8 flex flex-col items-center select-none">
      <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200 mb-4">
        <Heart size={28} fill="currentColor" />
      </div>
      <h3 className="text-xl font-black text-[#3b1a66] text-center mb-6 tracking-tight">
        Apoie a Instituição
      </h3>
      <div className="w-full flex flex-col gap-4">
        
        <div className="flex items-center text-left p-4 rounded-2xl border-2 border-purple-400 bg-purple-50 shadow-sm relative overflow-hidden animate-pulse">
          <div className="shrink-0 mr-4 bg-white text-purple-600 p-3.5 rounded-full shadow-sm">
            <Banknote size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-slate-800">Contribuição Financeira</span>
            <span className="block text-xs text-slate-500 mt-1 font-medium">Apoie os projetos via Pix.</span>
          </div>
        </div>

        <div className="flex items-center text-left p-4 rounded-2xl border border-slate-200 bg-white">
          <div className="shrink-0 mr-4 bg-slate-50 text-slate-500 p-3.5 rounded-full">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-slate-800">Doação de Materiais</span>
            <span className="block text-xs text-slate-500 mt-1 font-medium">Alimentos, roupas ou itens.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function MockupCard3() {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 flex flex-col items-center relative overflow-hidden select-none w-full">
      <div className="text-center mb-5 mt-2">
        <h3 className="text-xl font-black text-[#3b1a66]">Avalie a Instituição</h3>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="p-1">
            <Star 
              size={32} 
              strokeWidth={1.5}
              fill={s <= 5 ? "#facc15" : "transparent"} 
              color={s <= 5 ? "#facc15" : "#cbd5e1"} 
            />
          </div>
        ))}
      </div>

      <div className="text-center h-4 mb-5">
        <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">
          Excelente!
        </span>
      </div>

      <div className="w-full mb-5 relative">
        <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl animate-pulse pointer-events-none"></div>
        <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm h-24 text-slate-700 font-medium flex items-start relative z-10">
          O trabalho que eles fazem com as crianças é incrível! Acompanhei tudo de perto e fiquei muito feliz em ajudar.
        </div>
      </div>

      <div className="w-full py-3.5 bg-purple-600 text-white text-sm font-black rounded-xl shadow-md flex items-center justify-center gap-2">
        <Send size={16} />
        Enviar Avaliação
      </div>
    </div>
  );
}

function MockupCard4() {
  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 flex flex-col items-center text-center select-none w-full">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
        <AlertCircle size={32} className="text-amber-600" strokeWidth={2.5} />
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
        Avaliação Bloqueada
      </h3>
      
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 px-2">
        Para avaliar novamente, certifique-se de realizar uma nova doação. Isso garante feedbacks sempre reais!
      </p>

      <div className="w-full py-3.5 bg-purple-50 text-purple-700 border border-purple-200 text-sm font-black rounded-xl shadow-sm flex justify-center items-center gap-2">
        <Heart size={18} />
        Fazer Nova Doação
      </div>
    </div>
  );
}