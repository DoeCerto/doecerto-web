"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Package,
  ClipboardList,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  Star,
  HeartHandshake,
  Banknote
} from "lucide-react";

const STEPS = [
  // ... (Mantenha o conteúdo original da constante STEPS)
  {
    id: 1,
    title: "Encontre e ajude",
    highlight: "quem precisa",
    description: "Pesquise por causas que você ama na tela principal. Escolha a ONG ideal e clique no botão de apoiar para começar.",
    mockup: <MockupCard1 />,
  },
  {
    id: 2,
    title: "Escolha o tipo de",
    highlight: "doação",
    description: "No menu da ONG escolhida, selecione a opção 'Doação de Materiais' para enviar alimentos, roupas, ração ou itens específicos.",
    mockup: <MockupCard2 />,
  },
  {
    id: 3,
    title: "Descreva e",
    highlight: "adicione",
    description: "Selecione o tipo de item na lista, informe a quantidade exata e adicione detalhes importantes (ex: validade, tamanho).",
    mockup: <MockupCard3 />,
  },
  {
    id: 4,
    title: "Revise a lista e",
    highlight: "confirme",
    description: "Confira todos os itens adicionados. Se estiver tudo certo, clique em confirmar e a ONG entrará em contato para combinar a entrega!",
    mockup: <MockupCard4 />,
  },
];

function ItemDonationGuideContent() {
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

export default function ItemDonationGuide() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#6B39A7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ItemDonationGuideContent />
    </Suspense>
  );
}

// ... (MANTENHA TODOS OS MOCKUPS A PARTIR DAQUI SEM MEXER)

function MockupCard1() {
  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl w-full relative overflow-hidden select-none">
      
      <div className="relative mb-5 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <div className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-400 text-sm font-medium shadow-sm flex items-center">
          Pesquise uma ONG, cidade ou causa...
        </div>
      </div>

      <div className="flex gap-2.5 mb-6 overflow-hidden">
        <span className="bg-purple-600 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 shadow-sm">
          Causa Animal
        </span>
        <span className="bg-white border border-slate-200 text-slate-500 px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 hover:bg-slate-50">
          Educação
        </span>
      </div>

      <h4 className="text-base font-extrabold text-slate-800 mb-4 tracking-tight">ONGs recomendadas</h4>

      <div className="grid grid-cols-2 gap-4 relative">
        <div className="relative">
          <div className="absolute -inset-1.5 border-2 border-purple-500 rounded-[1.25rem] opacity-100 z-10 pointer-events-none animate-pulse"></div>

          <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full h-full relative z-0">
            <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Gatinho" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-extrabold text-slate-700">4.9</span>
              </div>
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase">
                  Causa Animal
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug mb-3 line-clamp-1">
                SOS Gatinhos
              </h3>
              <button className="mt-auto w-full bg-purple-600 text-white rounded-lg py-2 text-[11px] font-bold shadow-sm">
                Apoiar causa
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full h-full opacity-60">
          <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
              alt="Crianças" 
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-extrabold text-slate-700">4.8</span>
            </div>
          </div>

          <div className="p-3 flex flex-col flex-grow">
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase">
                Educação
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug mb-3 line-clamp-1">
              Inst. Crescer
            </h3>
            <button className="mt-auto w-full bg-slate-100 text-slate-400 rounded-lg py-2 text-[11px] font-bold shadow-sm">
              Apoiar causa
            </button>
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
        <HeartHandshake size={28} />
      </div>
      <h3 className="text-xl font-black text-[#3b1a66] text-center mb-6 tracking-tight">
        De qual forma deseja ajudar?
      </h3>
      <div className="w-full flex flex-col gap-4">
        
        <div className="flex items-center text-left p-4 rounded-2xl border border-slate-200 bg-white opacity-40">
          <div className="shrink-0 mr-4 bg-slate-50 text-slate-500 p-3.5 rounded-full">
            <Banknote size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-slate-800">Contribuição Financeira</span>
            <span className="block text-xs text-slate-500 mt-1 font-medium">Fazer um Pix para apoiar os projetos.</span>
          </div>
        </div>

        <div className="flex items-center text-left p-4 rounded-2xl border border-slate-200 bg-white shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 border-2 border-purple-500 rounded-2xl pointer-events-none"></div>
          <div className="shrink-0 mr-4 bg-purple-50 text-purple-600 p-3.5 rounded-full animate-pulse">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-slate-800">Doação de Materiais</span>
            <span className="block text-xs text-slate-500 mt-1 font-medium">Entregar alimentos, roupas ou itens.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function MockupCard3() {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 flex flex-col gap-5 relative overflow-hidden select-none w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <ClipboardList size={20} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Adicionar Item</h2>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Selecione o Item
        </label>
        <div className="w-full p-3.5 rounded-xl border border-purple-200 bg-white shadow-sm text-slate-700 font-bold text-sm flex justify-between items-center cursor-pointer">
          Ração para Gatos <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Qtd
          </label>
          <div className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm">
            5
          </div>
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Descrição
          </label>
          <div className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm truncate">
            Pacotes de 1kg
          </div>
        </div>
      </div>

      <div className="relative mt-2">
        <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl animate-pulse pointer-events-none"></div>
        <button className="w-full bg-purple-50 text-purple-700 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 border border-purple-100">
          <Plus size={18} strokeWidth={3} /> Incluir na Lista
        </button>
      </div>
    </div>
  );
}

function MockupCard4() {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 flex flex-col gap-4 relative overflow-hidden select-none w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-slate-900 text-lg">Sua Lista para ONG</h3>
        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">
          2 itens
        </span>
      </div>

      <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
        <div>
          <p className="font-bold text-slate-800 text-sm">5x Ração para Gatos</p>
          <p className="text-xs text-slate-500 mt-0.5">Pacotes de 1kg</p>
        </div>
        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
        <div>
          <p className="font-bold text-slate-800 text-sm">2x Cobertores</p>
          <p className="text-xs text-slate-500 mt-0.5">Limpos e higienizados</p>
        </div>
        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <button className="mt-4 w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-md flex items-center justify-center gap-2 animate-pulse">
        Confirmar e Enviar <ArrowRight size={18} />
      </button>
    </div>
  );
}