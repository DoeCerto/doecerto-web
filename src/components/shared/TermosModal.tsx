"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, FileText } from "lucide-react";

interface TermosModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TermosModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: TermosModalProps) {
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouIdade, setAceitouIdade] = useState(false);

  const podeConfirmar = aceitouTermos && aceitouIdade;

  function handleCancel() {
    setAceitouTermos(false);
    setAceitouIdade(false);
    onCancel();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            
            <div className="bg-[#6B39A7] px-6 pt-6 pb-5 relative">
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 text-[#6B39A7] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">
                    Antes de continuar
                  </h2>
                  <p className="text-purple-300 text-sm mt-0.5">
                    Confirme as declarações abaixo
                  </p>
                </div>
              </div>
            </div>

           
            <div className="px-6 py-5 flex flex-col gap-5">

              
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    className="sr-only"
                  />
                  
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      aceitouTermos
                        ? "bg-[#6B39A7] border-[#6B39A7]"
                        : "border-gray-300 bg-white group-hover:border-purple-400"
                    }`}
                  >
                    {aceitouTermos && (
                      <svg
                        viewBox="0 0 12 10"
                        fill="none"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          d="M1 5l3.5 3.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-base text-gray-700 leading-relaxed">
                  Li e aceito os{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B39A7] font-bold underline hover:text-purple-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B39A7] font-bold underline hover:text-purple-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Política de Privacidade
                  </a>{" "}
                  do DoeCerto.
                </span>
              </label>

              
              <div className="border-t border-gray-100" />

              {/* Checkbox 2 — Idade */}
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={aceitouIdade}
                    onChange={(e) => setAceitouIdade(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      aceitouIdade
                        ? "bg-[#6B39A7] border-[#6B39A7]"
                        : "border-gray-300 bg-white group-hover:border-purple-400"
                    }`}
                  >
                    {aceitouIdade && (
                      <svg
                        viewBox="0 0 12 10"
                        fill="none"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          d="M1 5l3.5 3.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-base text-gray-700 leading-relaxed">
                  Declaro que sou maior de 18 anos ou possuo autorização
                  expressa de meu responsável legal para utilizar esta
                  plataforma.
                </span>
              </label>

              {/* Aviso legal */}
              <div className="flex items-start gap-2 bg-purple-50 rounded-xl px-4 py-3 border border-purple-100">
                <FileText size={15} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-600 leading-relaxed">
                  Ao confirmar, você registra sua concordância com os documentos
                  legais do DoeCerto, conforme exigido pela LGPD (Lei nº 13.709/2018).
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="px-6 pb-6 flex flex-col gap-2">
              <button
                onClick={onConfirm}
                disabled={!podeConfirmar || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center transition-all active:scale-95 ${
                  podeConfirmar && !isLoading
                    ? "bg-[#6B39A7] text-white shadow-md hover:bg-purple-900"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar cadastro"
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
