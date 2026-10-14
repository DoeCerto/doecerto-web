"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowRight, Check, AlertCircle } from "lucide-react";
import { api } from "@/services/api";

export interface GuestDonationData {
  email: string;
  name?: string;
  phone?: string;
  isAnonymous: boolean;
  acceptedTerms: boolean;
}

interface GuestDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuestDonationData) => Promise<void> | void;
  type: "pix" | "material";
  summaryInfo?: {
    ongName?: string;
    amountOrQuantity?: string;
  };
  isLoading?: boolean;
  primaryButtonText?: string;
  initialData?: Partial<GuestDonationData> | null;
}

export function GuestDonationModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  summaryInfo,
  isLoading = false,
  primaryButtonText,
  initialData,
}: GuestDonationModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        if (initialData.email) setEmail(initialData.email);
        if (initialData.name) setName(initialData.name);
        if (initialData.phone) setPhone(initialData.phone);
        if (initialData.isAnonymous !== undefined) setIsAnonymous(initialData.isAnonymous);
      }
      setErrorMessage("");
    }
  }, [isOpen, initialData]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Por favor, informe seu e-mail para prosseguir.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    if (type === "material") {
      const rawDigits = phone.replace(/\D/g, "");
      if (rawDigits.length < 10) {
        setErrorMessage("Por favor, informe um número de WhatsApp/telefone com DDD.");
        return;
      }
    }

    if (!acceptedTerms) {
      setErrorMessage("É necessário concordar com os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

    try {
      try {
        let validateUrl = `/donations/validate-guest-email?email=${encodeURIComponent(cleanEmail)}`;
        if (cleanPhone) {
          validateUrl += `&phone=${encodeURIComponent(cleanPhone)}`;
        }
        await api(validateUrl);
      } catch (valErr: any) {
        setErrorMessage(valErr?.message || "Dados informados já possuem cadastro ou são inválidos.");
        return;
      }

      await onSubmit({
        email: cleanEmail.toLowerCase(),
        name: name.trim() || undefined,
        phone: cleanPhone || undefined,
        isAnonymous,
        acceptedTerms: true,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro ao processar seus dados. Tente novamente.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 font-sans">
          {/* Backdrop escuro com desfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Container do Modal com Padrão Fintech */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-4 sm:p-8 z-10 border border-slate-200/90 flex flex-col max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho com Logo Oficial DoeCerto */}
            <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
              <div className="mb-3">
                <Image
                  src="/logo-roxa.svg"
                  alt="DoeCerto"
                  width={140}
                  height={36}
                  className="h-7 sm:h-8 w-auto object-contain mx-auto"
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {type === "pix" ? "Identificação para Doação" : "Identificação do Doador"}
              </h3>

              <p className="text-xs sm:text-base text-slate-600 font-medium mt-1">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-[#6B39A7] font-bold underline hover:text-[#522982] transition-colors"
                >
                  Entrar
                </Link>
              </p>

              {/* Card de Resumo da Doação no estilo fintech */}
              {summaryInfo && (
                <div className="w-full mt-3.5 sm:mt-4 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left gap-2">
                  <div className="min-w-0 flex-1 pr-1.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Destino
                    </span>
                    <span className="block text-sm sm:text-base font-bold text-slate-900 truncate">
                      {summaryInfo.ongName || "Instituição"}
                    </span>
                  </div>
                  {summaryInfo.amountOrQuantity && (
                    <div className="text-right shrink-0">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {type === "pix" ? "Valor" : "Doação"}
                      </span>
                      <span className="block text-base sm:text-lg font-black text-[#6B39A7] font-mono">
                        {summaryInfo.amountOrQuantity}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mensagem de Erro com Alto Padrão de UX Writing */}
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200/90 text-red-900 p-3.5 sm:p-4 rounded-xl text-left flex items-start gap-3 shadow-xs">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-800">Atenção</p>
                  <p className="text-xs sm:text-sm font-medium text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Formulário com alta legibilidade */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* E-mail */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail <span className="text-[#6B39A7]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 rounded-xl font-bold text-base text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-white outline-none transition-all shadow-xs"
                  required
                />
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                  Enviaremos a confirmação para você acompanhar o status.
                </p>
              </div>

              {/* WhatsApp (somente para doação de materiais) */}
              {type === "material" && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp / Telefone com DDD <span className="text-[#6B39A7]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(99) 99999-9999"
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 rounded-xl font-bold text-base text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-white outline-none transition-all shadow-xs font-mono"
                    required
                  />
                  <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                    A instituição entrará em contato para alinhar data e local da entrega.
                  </p>
                </div>
              )}

              {/* Nome opcional */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seu nome <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você prefere ser chamado?"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 rounded-xl font-bold text-base text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-white outline-none transition-all shadow-xs"
                />
              </div>

              {/* Checkbox Anonimato com componente visual de alto padrão */}
              <label className="flex items-start gap-3 pt-1 cursor-pointer group select-none">
                <div className="mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isAnonymous
                        ? "bg-[#6B39A7] border-[#6B39A7] shadow-xs"
                        : "border-slate-300 bg-white group-hover:border-purple-400"
                    }`}
                  >
                    {isAnonymous && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
                <div>
                  <span className="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Ocultar meu nome (Doar anonimamente)
                  </span>
                  <span className="block text-sm text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Seu nome não será exibido publicamente nem para a instituição.
                  </span>
                </div>
              </label>

              {/* Checkbox Termos de Uso e LGPD com componente visual de alto padrão */}
              <label className="flex items-start gap-3 pt-1 cursor-pointer group select-none">
                <div className="mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      acceptedTerms
                        ? "bg-[#6B39A7] border-[#6B39A7] shadow-xs"
                        : "border-slate-300 bg-white group-hover:border-purple-400"
                    }`}
                  >
                    {acceptedTerms && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
                <span className="text-[15px] sm:text-base text-slate-700 font-medium leading-relaxed">
                  Declaro que concordo com os{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B39A7] font-bold underline hover:text-[#522982]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B39A7] font-bold underline hover:text-[#522982]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              {/* Botão de Avançar */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full bg-[#6B39A7] hover:bg-[#582d8c] text-white py-4 rounded-xl font-bold text-base sm:text-lg shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {primaryButtonText ||
                        (type === "pix"
                          ? "Continuar para o Pagamento Pix"
                          : "Confirmar Intenção de Doação")}
                    </span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Botão Cancelar */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
