"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Loader2,
  X,
  CheckCircle2,
  Copy,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import toast from "react-hot-toast";
import { LgpdService } from "@/services/lgpd.service";
import { useAuth } from "@/contexts/AuthContext";

interface LgpdDeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "donor" | "ong" | string;
}

const REQUIRED_PHRASE = "EXCLUIR MINHA CONTA DEFINITIVAMENTE";

export function LgpdDeleteAccountModal({
  isOpen,
  onClose,
  userRole,
}: LgpdDeleteAccountModalProps) {
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactorField, setShowTwoFactorField] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  const isPhraseValid = confirmationPhrase.trim() === REQUIRED_PHRASE;
  const canSubmit = isPhraseValid && currentPassword.length > 0 && !isDeleting;

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(REQUIRED_PHRASE);
    setCopiedPhrase(true);
    toast.success("Frase copiada para a área de transferência!");
    setTimeout(() => setCopiedPhrase(false), 2500);
  };

  const handlePastePhrase = () => {
    setConfirmationPhrase(REQUIRED_PHRASE);
  };

  const resetForm = () => {
    setCurrentPassword("");
    setTwoFactorCode("");
    setConfirmationPhrase("");
    setIsDeleting(false);
  };

  const handleClose = () => {
    if (isDeleting) return;
    resetForm();
    onClose();
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsDeleting(true);

      const response = await LgpdService.deleteAccount({
        currentPassword,
        confirmationPhrase: confirmationPhrase.trim(),
        twoFactorCode: twoFactorCode.trim() || undefined,
      });

      toast.success(
        response.message || "Conta excluída e anonimizada com sucesso.",
        { duration: 5000 }
      );

      // Desloga o usuário e redireciona de volta para a Home
      setTimeout(async () => {
        await logout("/");
        if (typeof window !== "undefined") {
          window.location.replace("/");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Erro na exclusão da conta:", error);
      const backendMessage =
        error?.data?.message ||
        error?.message ||
        "Não foi possível excluir sua conta. Verifique sua senha e tente novamente.";

      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage;

      toast.error(displayMessage, { duration: 6000 });

      // Se o backend avisou sobre 2FA obrigatório, exibe o campo
      if (
        typeof displayMessage === "string" &&
        displayMessage.toLowerCase().includes("dois fatores")
      ) {
        setShowTwoFactorField(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-8 z-10"
          >
            {/* Top Bar Destrutiva */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-inner shrink-0">
                    <ShieldAlert size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-red-100/70 text-red-700 mb-1">
                      <AlertTriangle size={12} /> Zona de Perigo • LGPD
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Exclusão Definitiva
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Box Informativo LGPD */}
              <div className="bg-gradient-to-b from-red-50/70 to-rose-50/30 border border-red-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 space-y-2 mb-6">
                <p className="font-semibold text-red-950 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-red-600 shrink-0" />
                  Esta operação é irreversível e irrevogável:
                </p>
                <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
                  <li>
                    Seus dados pessoais (nome, CPF, fotos, telefones e endereços) serão anonimizados e apagados dos servidores.
                  </li>
                  <li>
                    Seus acessos serão imediatamente revogados e sua conta será encerrada.
                  </li>
                  {userRole === "ong" && (
                    <li className="text-amber-800 font-medium">
                      Caso sua organização possua repasses pendentes, a exclusão será bloqueada até a conclusão financeira.
                    </li>
                  )}
                  <li className="text-[11px] text-slate-500">
                    Registros fiscais e contábeis de doações passadas são mantidos sob identificação anônima para conformidade legal (Art. 16, I da LGPD).
                  </li>
                </ul>
              </div>

              {/* Formulário de Segurança */}
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                {/* Senha Atual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Sua Senha Atual <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha para confirmar"
                      required
                      disabled={isDeleting}
                      className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Código 2FA (se aplicável ou se acionado) */}
                {showTwoFactorField ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Código de Autenticação 2FA
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound size={17} />
                      </div>
                      <input
                        type="text"
                        maxLength={8}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\s/g, ""))}
                        placeholder="Código de 6 dígitos ou código de backup"
                        disabled={isDeleting}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all font-mono tracking-widest text-slate-900"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTwoFactorField(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 font-medium pt-1"
                  >
                    <KeyRound size={13} />
                    Possuo autenticação de dois fatores (2FA) ativada
                  </button>
                )}

                {/* Frase de Confirmação */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Confirmação por Escrito <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyPhrase}
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
                        title="Copiar frase exata"
                      >
                        <Copy size={11} /> {copiedPhrase ? "Copiado!" : "Copiar frase"}
                      </button>
                      <button
                        type="button"
                        onClick={handlePastePhrase}
                        className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                        title="Preencher automaticamente"
                      >
                        <FileCheck2 size={11} /> Colar
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                    Para garantir que esta não é uma ação acidental, digite a frase:
                  </p>

                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 tracking-wide select-all text-center mb-2">
                    {REQUIRED_PHRASE}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={confirmationPhrase}
                      onChange={(e) => setConfirmationPhrase(e.target.value)}
                      placeholder="Digite a frase exatamente como exibida acima"
                      required
                      disabled={isDeleting}
                      className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl outline-none transition-all font-medium ${
                        isPhraseValid
                          ? "bg-emerald-50/50 border-2 border-emerald-500 text-emerald-950 focus:ring-4 focus:ring-emerald-100"
                          : "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      }`}
                    />
                    {isPhraseValid && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isDeleting}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-[0.99] shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      "Excluir Minha Conta"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
