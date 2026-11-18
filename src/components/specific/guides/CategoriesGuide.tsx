"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Tag,
  Search,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

// 1. Descubra as categorias → 2. Filtre por causa → 3. Encontre ONGs perfeitas
const STEPS = [
  {
    id: 1,
    title: "Descubra as",
    highlight: "categorias",
    description:
      "Na tela principal, cada ONG possui badges de categoria. Explore causas como Educação, Saúde, Causa Animal e muitas outras.",
    mockup: <MockupCard1 />,
  },
  {
    id: 2,
    title: "Filtre por",
    highlight: "causa",
    description:
      "Use os filtros e a barra de pesquisa para encontrar ONGs de uma categoria específica. Combine filtros para refinar ainda mais os resultados.",
    mockup: <MockupCard2 />,
  },
  {
    id: 3,
    title: "Encontre ONGs",
    highlight: "perfeitas",
    description:
      "Cada ONG exibe suas categorias no perfil público. Assim você sabe exatamente quais causas ela apoia antes de fazer sua doação.",
    mockup: <MockupCard3 />,
  },
];

function CategoriesGuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  // O Padrão Ouro: Captura de onde o usuário veio na URL. Se não tiver parâmetro, o fallback seguro é a "/help-center".
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
      
      {/* HEADER: Voltar, Contador e Botão Pular */}
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

      {/* CONTEÚDO PRINCIPAL */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 sm:px-12 pt-24 lg:pt-0 gap-12 lg:gap-20">
        
        {/* LADO ESQUERDO: Mockup Fixo */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
          
          <div className="w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] transition-all duration-300">
            {STEPS[currentStep].mockup}
          </div>
        </div>

        {/* LADO DIREITO: Textos e Controles */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left pb-12 lg:pb-0">
          
          {/* Textos */}
          <div className="w-full max-w-[480px] min-h-[180px]">
            <h1 className="text-4xl sm:text-[3rem] font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
              {STEPS[currentStep].title} <br />
              <span className="text-[#6B39A7]">{STEPS[currentStep].highlight}</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* CONTROLES: Anterior, Paginação e Botão Next */}
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

            {/* Paginação Dots */}
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

            {/* Botão Próximo */}
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

// ==========================================
// MOCKUPS REAIS DA PLATAFORMA
// ==========================================

// Mockup 1: Grade de categorias — mostra as tags como no perfil público da ONG
function MockupCard1() {
  const categories = [
    "Causa Animal",
    "Educação",
    "Saúde",
    "Assistência Social",
    "Meio Ambiente",
    "Criança e Adolescente",
  ];

  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl w-full relative overflow-hidden select-none">
      
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 rounded-xl bg-purple-100">
          <Layers size={18} className="text-purple-700" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800 tracking-tight">Categorias disponíveis</h4>
      </div>

      {/* Grid de categorias — estilo do perfil público */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm ${
              idx === 0 ? "ring-2 ring-purple-500 ring-offset-1" : ""
            }`}
          >
            <Tag size={12} className="text-purple-400" /> {cat}
          </span>
        ))}
      </div>

      {/* Indicador de mais categorias */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold">
        <span>e muito mais...</span>
      </div>
    </div>
  );
}

// Mockup 2: Tela de filtros — mostra a barra de pesquisa + filtros de categoria
function MockupCard2() {
  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl w-full relative overflow-hidden select-none">
      
      {/* Search Fake */}
      <div className="relative mb-5 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <div className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-400 text-sm font-medium shadow-sm flex items-center">
          Pesquise uma ONG, cidade ou causa...
        </div>
      </div>

      {/* Barra de Filtros Fake */}
      <div className="flex gap-2.5 mb-5 overflow-hidden">
        <span className="flex items-center gap-1.5 bg-purple-700 text-white px-3.5 py-2 rounded-full text-[11px] font-bold shrink-0 shadow-sm">
          <SlidersHorizontal size={12} /> Filtros
          <span className="bg-white text-purple-700 text-[9px] w-4 h-4 flex items-center justify-center rounded-full ml-0.5 font-black">1</span>
        </span>
        <span className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-full text-[11px] font-bold shrink-0">
          Mais próximas
        </span>
      </div>

      {/* Filtros de categoria ativos — estilo do perfil público */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Categorias</h5>
        <div className="flex flex-wrap gap-2">
          {/* Ativo */}
          <div className="relative">
            <div className="absolute -inset-0.5 border-2 border-purple-500 rounded-xl pointer-events-none"></div>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm animate-pulse">
              <Tag size={12} className="text-purple-400" /> Causa Animal
            </span>
          </div>
          {/* Inativos */}
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-purple-400" /> Educação
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-purple-400" /> Saúde
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-purple-400" /> Meio Ambiente
          </span>
        </div>
      </div>

      {/* Resultado Fake */}
      <div className="text-center text-sm font-bold text-slate-400">
        <span className="text-purple-600">4</span> ONGs encontradas
      </div>
    </div>
  );
}

// Mockup 3: Perfil da ONG com categorias em destaque
function MockupCard3() {
  return (
    <div className="flex flex-col gap-4">
      {/* Card de ONG com categorias (Destaque) */}
      <div className="bg-white rounded-2xl p-5 shadow-xl border border-purple-200 w-full relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              alt="ONG"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm">SOS Gatinhos</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[11px] font-bold text-slate-500">4.9 • Causa Animal</span>
            </div>
          </div>
        </div>

        {/* Badges de categorias — estilo do perfil público */}
        <div className="flex justify-center mt-1 mb-1">
          <div className="relative inline-flex flex-wrap justify-center gap-2 px-3 py-2 rounded-2xl">
            <div className="absolute -inset-0.5 border-2 border-purple-500 rounded-2xl pointer-events-none animate-pulse"></div>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
              <Tag size={12} className="text-purple-400" /> Causa Animal
            </span>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
              <Tag size={12} className="text-purple-400" /> Saúde
            </span>
          </div>
        </div>
      </div>

      {/* Card secundário (opacidade menor) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 w-full opacity-60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              alt="ONG"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm">Instituto Crescer</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[11px] font-bold text-slate-500">4.8 • Educação</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-purple-400" /> Educação
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-purple-400" /> Assistência Social
          </span>
        </div>
      </div>
    </div>
  );
}

// Export default embrulhado em Suspense
export default function CategoriesGuide() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#6B39A7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CategoriesGuideContent />
    </Suspense>
  );
}
