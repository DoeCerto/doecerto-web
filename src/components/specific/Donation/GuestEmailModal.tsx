"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Loader2, Lock, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

// ==========================================
// Persistência do e-mail e WhatsApp do visitante (somente na sessão do navegador)
// ==========================================

const GUEST_EMAIL_KEY = "doecerto:guestDonorEmail";
const GUEST_PHONE_KEY = "doecerto:guestDonorPhone";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function saveGuestEmail(email: string) {
  try {
    sessionStorage.setItem(GUEST_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    /* sessionStorage indisponível */
  }
}

export function readGuestEmail(): string {
  try {
    return sessionStorage.getItem(GUEST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function saveGuestPhone(phone: string) {
  try {
    sessionStorage.setItem(GUEST_PHONE_KEY, phone.trim());
  } catch {
    /* sessionStorage indisponível */
  }
}

export function readGuestPhone(): string {
  try {
    return sessionStorage.getItem(GUEST_PHONE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearGuestEmail() {
  try {
    sessionStorage.removeItem(GUEST_EMAIL_KEY);
    sessionStorage.removeItem(GUEST_PHONE_KEY);
  } catch {
    /* noop */
  }
}

export function clearGuestPhone() {
  try {
    sessionStorage.removeItem(GUEST_PHONE_KEY);
  } catch {
    /* noop */
  }
}

// ==========================================
// ==========================================

interface GuestEmailFormProps {
  onSubmit: (email: string, phone?: string, turnstileToken?: string) => Promise<void> | void;
  onBack?: () => void;
  ongName?: string;
  initialEmail?: string;
  initialPhone?: string;
  isLoading?: boolean;
  submitLabel?: string;
  type?: "money" | "material";
}

export function GuestEmailForm({
  onSubmit,
  onBack,
  ongName,
  initialEmail = "",
  initialPhone = "",
  isLoading = false,
  submitLabel = "Continuar",
  type = "money",
}: GuestEmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Informe um endereço de e-mail válido.");
      inputRef.current?.focus();
      return;
    }

    let cleanPhone = "";
    if (type === "material") {
      cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setError("Informe um número de WhatsApp válido com DDD.");
        return;
      }
    }

    setError("");
    try {
      // Validação em tempo real do e-mail e WhatsApp de visitante na API
      try {
        let validateUrl = `/donations/validate-guest-email?email=${encodeURIComponent(cleanEmail)}`;
        if (cleanPhone) {
          validateUrl += `&phone=${encodeURIComponent(cleanPhone)}`;
        }
        await api(validateUrl);
      } catch (valErr: any) {
        setError(valErr?.message || "Dados informados já possuem cadastro ou são inválidos.");
        return;
      }

      await onSubmit(cleanEmail, cleanPhone, turnstileToken || undefined);
    } catch (err: any) {
      setError(err?.message || "Não foi possível continuar. Tente novamente.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-700 p-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
      )}

      <Image
        src="/logo-roxa.svg"
        alt="DoeCerto"
        width={140}
        height={36}
        className="h-8 w-auto object-contain mb-6"
        priority
      />

      <h2 className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight leading-tight">
        Doe sem criar conta
      </h2>
      <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 leading-relaxed max-w-[360px]">
        {ongName ? (
          type === "material" ? (
            <>
              Informe seu e-mail e WhatsApp para doar materiais para{" "}
              <strong className="text-slate-900 font-bold">{ongName}</strong>.
            </>
          ) : (
            <>
              Informe seu e-mail para receber a confirmação da sua doação e ajudar{" "}
              <strong className="text-slate-900 font-bold">{ongName}</strong>.
            </>
          )
        ) : (
          type === "material"
            ? "Informe seu contato para combinar a entrega dos materiais."
            : "Informe seu e-mail para receber o comprovante da sua doação."
        )}
      </p>

      <form onSubmit={handleSubmit} className="w-full mt-7 flex flex-col gap-4" noValidate>
        <div className="text-left">
          <label htmlFor="guest-email-input" className="sr-only">
            Endereço de e-mail
          </label>
          <input
            id="guest-email-input"
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Endereço de e-mail"
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? "guest-email-error" : undefined}
            className={`w-full px-5 py-4 rounded-xl border-2 bg-white text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium outline-none transition-all ${error
              ? "border-red-400 focus:ring-4 focus:ring-red-100"
              : "border-slate-200 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100"
              }`}
          />
        </div>

        {type === "material" && (
          <div className="text-left">
            <label htmlFor="guest-phone-input" className="sr-only">
              WhatsApp com DDD
            </label>
            <input
              id="guest-phone-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                if (error) setError("");
              }}
              placeholder="WhatsApp com DDD (ex: 81 99999-9999)"
              disabled={isLoading}
              className={`w-full px-5 py-4 rounded-xl border-2 bg-white text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium outline-none transition-all font-mono ${error
                ? "border-red-400 focus:ring-4 focus:ring-red-100"
                : "border-slate-200 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100"
                }`}
            />
            <p className="text-sm text-slate-500 font-medium mt-1 pl-1">
              A instituição entrará em contato para alinhar os detalhes da entrega.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 sm:p-4 bg-red-50 border border-red-200/90 rounded-xl text-left text-red-900 flex items-start gap-3 shadow-xs">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-red-800">Atenção</p>
              <p id="guest-email-error" className="text-xs sm:text-sm font-medium text-red-700 mt-0.5 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
        />

        <button
          id="guest-email-continue"
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white font-black text-base shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : submitLabel}
        </button>
      </form>

      <div className="w-full flex items-center gap-3 my-5">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-base text-slate-500 font-medium">ou</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Link
        id="guest-email-login"
        href="/login"
        className="w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-base hover:border-[#6B39A7] hover:text-[#6B39A7] transition-colors"
      >
        Entrar na minha conta
      </Link>

      <div className="mt-6 flex items-start gap-3 text-left bg-slate-50 rounded-xl p-4 w-full border border-slate-200/60">
        <Lock size={22} className="text-[#6B39A7] shrink-0 mt-0.5" />
        <p className="text-[15px] sm:text-base text-slate-700 font-medium leading-relaxed">
          Sua doação é <strong className="text-slate-900">anônima</strong>: seu nome não aparece para ninguém.
          {type === "material"
            ? " Usamos seus dados apenas para enviar o comprovante e combinar a entrega dos materiais."
            : " Usamos o e-mail apenas para enviar o comprovante."}
        </p>
      </div>

      <p className="text-[15px] sm:text-base text-slate-600 font-medium mt-4 leading-relaxed">
        Ao continuar, você concorda com os{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-bold text-slate-700 hover:text-[#6B39A7]">
          Termos de Uso
        </a>{" "}
        e a{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-slate-700 hover:text-[#6B39A7]">
          Política de Privacidade
        </a>
        .
      </p>
    </div>
  );
}

// ==========================================
// Modal standalone (usado na página do Pix para "Alterar" / acesso direto)
// ==========================================

interface GuestEmailModalProps extends GuestEmailFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestEmailModal({ isOpen, onClose, isLoading, ...formProps }: GuestEmailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={isLoading ? undefined : onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-[440px] px-5 py-7 sm:px-10 sm:py-9 z-10 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <GuestEmailForm isLoading={isLoading} {...formProps} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
