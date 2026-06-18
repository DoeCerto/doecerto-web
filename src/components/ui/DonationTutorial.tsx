"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ScanLine,
  CreditCard,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Heart,
} from "lucide-react";

const STEPS = [
  {
    icon: CreditCard,
    title: "Escolha o valor da doação",
    description:
      "Selecione um dos valores sugeridos ou informe o valor que deseja doar para esta ONG.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: ScanLine,
    title: "Realize o pagamento via Pix",
    description:
      "Escaneie o QR Code ou copie a chave Pix exibida nesta tela e conclua a transferência pelo aplicativo do seu banco.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Upload,
    title: "Envie o comprovante",
    description:
      "Após finalizar o Pix, envie o comprovante da transferência para registrar sua doação no sistema.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Heart,
    title: "Sua ajuda está a caminho",
    description:
      "Perfeito! Sua doação foi informada e seguirá para validação. Obrigado por contribuir com esta causa.",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

export default function DonationTutorialModal() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem("hideDonationTutorial", "true");
    }
    setOpen(false);
  }, [dontShowAgain]);

  useEffect(() => {
    const hidden = localStorage.getItem("hideDonationTutorial");
    if (hidden !== "true") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  const handleStepChange = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStepIndex(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  if (!open) return null;

  const step = STEPS[stepIndex];
  const Icon = step.icon;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.25)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                Guia rápido
              </span>

              <h2 className="mt-4 text-2xl font-black text-[#3b1a66] leading-tight">
                Como funciona a doação?
              </h2>

              <p className="text-sm text-gray-700 mt-2 font-medium">
                Leva menos de 1 minuto para concluir.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-50 rounded-full"
              aria-label="Fechar tutorial"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div 
          className={`px-8 py-10 flex flex-col items-center text-center min-h-[360px] justify-center transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className={`w-28 h-28 rounded-[2rem] ${step.bg} flex items-center justify-center mb-8 shadow-sm`}
          >
            <Icon size={50} className={step.color} />
          </div>

          <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            Passo {stepIndex + 1} de {STEPS.length}
          </span>

          <h3 className="text-[28px] font-black text-[#3b1a66] mt-5 leading-tight">
            {step.title}
          </h3>

          <p className="text-gray-700 text-[15px] leading-relaxed mt-4 max-w-xs font-medium">
            {step.description}
          </p>

          <div className="flex items-center gap-2 mt-8">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepChange(index)}
                className={`transition-all duration-300 rounded-full h-2 ${
                  index === stepIndex ? "w-10 bg-purple-600" : "w-2 bg-purple-200 hover:bg-purple-300"
                }`}
                aria-label={`Ir para o passo ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleStepChange(stepIndex - 1)}
              disabled={stepIndex === 0}
              className={`flex items-center gap-2 font-bold transition-colors ${
                stepIndex === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-purple-600 hover:text-purple-700"
              }`}
            >
              <ChevronLeft size={18} />
              Voltar
            </button>

            {stepIndex < STEPS.length - 1 ? (
              <button
                onClick={() => handleStepChange(stepIndex + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Próximo
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle2 size={18} />
                Começar a doar
              </button>
            )}
          </div>

          <label className="flex items-center justify-center gap-2.5 py-1 text-gray-500 hover:text-gray-700 cursor-pointer select-none transition-colors group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600 transition-all"
            />
            <span className="text-xs font-semibold group-hover:underline">
              Não mostrar este guia novamente
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}