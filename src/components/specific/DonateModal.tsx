"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Banknote, Package } from "lucide-react";

type Props = {
  onClose: () => void;
  onDonateMoney: () => void;
  onDonateItems: () => void;
};

export default function DonateModal({ onClose, onDonateMoney, onDonateItems }: Props) {
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

      {/* Modal mais largo (max-w-[520px]) e com padding vertical equilibrado */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[520px] px-8 py-8 lg:px-10 z-10 flex flex-col items-center"
      >
        {/* Ícone principal um pouco mais compacto */}
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200 mb-4">
          <HeartHandshake size={28} />
        </div>

        <h3 className="text-xl lg:text-2xl font-black text-[#3b1a66] text-center mb-6">
          De qual forma deseja ajudar?
        </h3>

        <div className="w-full flex flex-col gap-4">
          {/* Opção Dinheiro - Borda fina (1px) */}
          <button
            onClick={onDonateMoney}
            className="group w-full flex items-center text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <div className="shrink-0 mr-4 bg-slate-50 p-3.5 rounded-full text-slate-500 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
              <Banknote size={24} strokeWidth={2.5} />
            </div>
            
            <div>
              <span className="block font-black text-lg text-slate-800 group-hover:text-purple-700 transition-colors">
                Contribuição Financeira
              </span>
              <span className="block text-sm text-slate-500 group-hover:text-purple-600 mt-1 leading-relaxed font-medium transition-colors">
                Quero fazer um Pix para apoiar os projetos da ONG.
              </span>
            </div>
          </button>

          {/* Opção Itens - Borda fina (1px) */}
          <button
            onClick={onDonateItems}
            className="group w-full flex items-center text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <div className="shrink-0 mr-4 bg-slate-50 p-3.5 rounded-full text-slate-500 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
              <Package size={24} strokeWidth={2.5} />
            </div>

            <div>
              <span className="block font-black text-lg text-slate-800 group-hover:text-purple-700 transition-colors">
                Doação de Materiais
              </span>
              <span className="block text-sm text-slate-500 group-hover:text-purple-600 mt-1 leading-relaxed font-medium transition-colors">
                Quero entregar alimentos, roupas ou outros materiais.
              </span>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer uppercase tracking-widest"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}