"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  IdCard,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  completeGoogleDonorOnboarding,
  extractApiErrorMessage,
  type GoogleProfileSummary,
  type LoginResponse,
} from "@/services/login.service";
import {
  formatCPF,
  removeFormatting,
  validateCPF,
} from "@/utils/documentValidation";

interface GoogleDonorOnboardingCardProps {
  onboardingToken: string;
  googleProfile: GoogleProfileSummary;
  backLabel?: string;
  onBack: () => void;
  onCompleted: (sessionData: LoginResponse, email: string) => Promise<void>;
}

export default function GoogleDonorOnboardingCard({
  onboardingToken,
  googleProfile,
  backLabel = "Voltar ao login",
  onBack,
  onCompleted,
}: GoogleDonorOnboardingCardProps) {
  const [name, setName] = useState(googleProfile.name || "");
  const [cpf, setCpf] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstName =
    (name.trim() || googleProfile.name || "Doador").split(/\s+/)[0] || "Doador";
  const initials = (googleProfile.name || googleProfile.email || "D")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setCpfError(null);
    setSubmitError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setNameError("Informe seu nome completo (mínimo de 3 caracteres).");
      return;
    }

    const cleanCpf = removeFormatting(cpf);
    if (cleanCpf.length !== 11 || !validateCPF(cleanCpf)) {
      setCpfError("Informe um CPF válido com 11 dígitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeGoogleDonorOnboarding({
        onboardingToken,
        cpf: cleanCpf,
        name: trimmedName,
      });
      await onCompleted(res.data, googleProfile.email);
    } catch (err: unknown) {
      const resolved = extractApiErrorMessage(
        err,
        "Não foi possível concluir seu cadastro com o Google.",
      );
      if (resolved.toLowerCase().includes("cpf")) {
        setCpfError(resolved);
      } else {
        setSubmitError(resolved);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F5F7] overflow-y-auto">
      {/* Formas geométricas sutis de fundo no estilo GoFundMe */}
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      >
        <div className="absolute -top-28 -left-24 w-[460px] h-[460px] rounded-[4.5rem] bg-[#EAECEF] rotate-12" />
        <div className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-[5rem] bg-[#EAECEF]/80 -rotate-12" />
        <div className="absolute top-12 -right-28 w-[500px] h-[500px] rounded-[4.5rem] bg-[#EDE9F5]/80 rotate-[24deg]" />
      </div>

      <div className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[540px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-gray-100 p-7 sm:p-10 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors w-fit -ml-1 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            {backLabel}
          </button>

          {/* Resumo da conta Google conectada */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-white to-slate-50 border border-purple-100/90 shadow-xs flex items-center gap-4">
            <div className="relative shrink-0">
              {googleProfile.picture ? (
                <Image
                  src={googleProfile.picture}
                  alt={googleProfile.name || "Foto do perfil Google"}
                  width={68}
                  height={68}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-[#6B39A7] text-white font-bold text-2xl flex items-center justify-center border-2 border-white shadow-md">
                  {initials}
                </div>
              )}
              <span
                title="E-mail verificado pelo Google"
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              >
                <CheckCircle2 size={14} strokeWidth={2.8} />
              </span>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                Conta Google conectada
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate leading-tight">
                {name.trim() || googleProfile.name}
              </p>
              <p className="text-base text-gray-600 font-medium truncate mt-0.5">
                {googleProfile.email}
              </p>
            </div>
          </div>

          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2.5 tracking-tight leading-tight">
              Quase lá, {firstName}!
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
              Para finalizar seu cadastro e proteger suas doações via Pix, confirme seu CPF abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {submitError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm sm:text-base font-semibold animate-in fade-in">
                <AlertCircle size={22} className="shrink-0 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="googleOnboardingName"
                className="text-gray-800 text-base sm:text-lg font-bold tracking-wide"
              >
                Nome completo
              </label>
              <div className="relative group">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    nameError
                      ? "text-red-500"
                      : "text-gray-400 group-focus-within:text-[#6B39A7]"
                  }`}
                  size={22}
                />
                <input
                  id="googleOnboardingName"
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg sm:text-xl font-medium shadow-sm ${
                    nameError
                      ? "border-red-400 focus:border-red-500 ring-red-100 ring-2"
                      : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"
                  }`}
                />
              </div>
              {nameError && (
                <span className="text-red-500 text-sm sm:text-base font-bold">
                  {nameError}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="googleOnboardingCpf"
                className="text-gray-800 text-base sm:text-lg font-bold tracking-wide"
              >
                CPF do titular
              </label>
              <div className="relative group">
                <IdCard
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    cpfError
                      ? "text-red-500"
                      : "text-gray-400 group-focus-within:text-[#6B39A7]"
                  }`}
                  size={22}
                />
                <input
                  id="googleOnboardingCpf"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCPF(e.target.value));
                    if (cpfError) setCpfError(null);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg sm:text-xl font-medium shadow-sm ${
                    cpfError
                      ? "border-red-400 focus:border-red-500 ring-red-100 ring-2"
                      : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"
                  }`}
                />
              </div>
              {cpfError ? (
                <span className="text-red-500 text-sm sm:text-base font-bold">
                  {cpfError}
                </span>
              ) : (
                <span className="inline-flex items-start gap-2 text-sm sm:text-base text-gray-600 font-medium leading-snug mt-0.5">
                  <ShieldCheck size={18} className="text-[#6B39A7] shrink-0 mt-0.5" />
                  Seu CPF é usado apenas para emissão de recibos e antifraude Pix (LGPD).
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || removeFormatting(cpf).length !== 11}
              className="w-full flex justify-center items-center gap-2 h-[60px] mt-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg sm:text-xl rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Concluindo cadastro...
                </>
              ) : (
                "Concluir cadastro e entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
