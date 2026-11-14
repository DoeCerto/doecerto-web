"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Banknote, Package, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GuestEmailForm, saveGuestEmail, saveGuestPhone } from "@/components/specific/Donation/GuestEmailModal";

type Props = {
  onClose: () => void;
  onDonateMoney: () => void;
  onDonateItems: () => void;
  ongName?: string;
};

export default function DonateModal({ onClose, onDonateMoney, onDonateItems, ongName }: Props) {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<"choose" | "guest">("choose");
  const [targetFlow, setTargetFlow] = useState<"money" | "material">("money");

  const handleMoneyClick = () => {
    // Redireciona direto para a tela de Pix (o e-mail e dados são coletados de forma unificada no checkout)
    onDonateMoney();
  };

  const handleItemsClick = () => {
    if (isAuthenticated) {
      onDonateItems();
      return;
    }
    setTargetFlow("material");
    setStep("guest");
  };

  const handleGuestSubmit = (email: string, phone?: string) => {
    saveGuestEmail(email);
    if (phone) saveGuestPhone(phone);
    if (targetFlow === "money") {
      onDonateMoney();
    } else {
      onDonateItems();
    }
  };

  if (step === "guest") {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 backdrop-blur-sm bg-black/40 cursor-pointer"
          onClick={onClose}
        />
        <motion.div
          key="guest-step"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] px-6 py-8 sm:px-10 sm:py-9 z-10 max-h-[92vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
          <GuestEmailForm
            type={targetFlow}
            onBack={() => setStep("choose")}
            onSubmit={handleGuestSubmit}
            ongName={ongName}
            submitLabel={targetFlow === "money" ? "Continuar para o Pix" : "Continuar para a Doação"}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Fundo escuro com desfoque e animação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-sm bg-black/40 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal mais largo (max-w-[540px]) e com padding vertical equilibrado */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-[540px] px-6 py-8 sm:px-10 sm:py-9 z-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200 mb-5">
          <HeartHandshake size={32} />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-6 tracking-tight">
          De qual forma deseja ajudar?
        </h3>

        <div className="w-full flex flex-col gap-4">
          {/* Opção Dinheiro */}
          <button
            onClick={handleMoneyClick}
            className="group w-full flex items-center text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50/70 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <div className="shrink-0 mr-4 bg-purple-50 p-3.5 rounded-2xl text-purple-600 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
              <Banknote size={26} strokeWidth={2.5} />
            </div>
            
            <div>
              <span className="block font-black text-lg sm:text-xl text-slate-800 group-hover:text-purple-700 transition-colors">
                Contribuição Financeira
              </span>
              <span className="block text-base text-slate-600 group-hover:text-purple-700 mt-1 leading-relaxed font-medium transition-colors">
                Quero fazer um Pix para apoiar os projetos da ONG.
              </span>
            </div>
          </button>

          {/* Opção Itens */}
          <button
            onClick={handleItemsClick}
            className="group w-full flex items-center text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50/70 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <div className="shrink-0 mr-4 bg-purple-50 p-3.5 rounded-2xl text-purple-600 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
              <Package size={26} strokeWidth={2.5} />
            </div>

            <div>
              <span className="block font-black text-lg sm:text-xl text-slate-800 group-hover:text-purple-700 transition-colors">
                Doação de Materiais
              </span>
              <span className="block text-base text-slate-600 group-hover:text-purple-700 mt-1 leading-relaxed font-medium transition-colors">
                Quero entregar alimentos, roupas ou outros materiais.
              </span>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 py-2 px-6 rounded-xl text-base font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}