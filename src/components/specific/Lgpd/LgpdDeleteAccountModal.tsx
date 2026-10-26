"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  Check,
  KeyRound,
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
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isPhraseValid = confirmationPhrase.trim() === REQUIRED_PHRASE;
  const canSubmit = isPhraseValid && currentPassword.length > 0 && !isDeleting;

  const resetForm = () => {
    setCurrentPassword("");
    setTwoFactorCode("");
    setConfirmationPhrase("");
    setShowTwoFactor(false);
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

      toast.success(response.message || "Conta excluída com sucesso.");

      setTimeout(async () => {
        await logout("/");
        if (typeof window !== "undefined") {
          window.location.replace("/");
        }
      }, 1200);
    } catch (error: any) {
      console.error("Erro na exclusão da conta:", error);
      const backendMessage =
        error?.data?.message ||
        error?.message ||
        "Não foi possível excluir sua conta. Verifique sua senha.";

      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage;

      toast.error(displayMessage);

      if (
        typeof displayMessage === "string" &&
        displayMessage.toLowerCase().includes("dois fatores")
      ) {
        setShowTwoFactor(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Excluir conta definitivamente?
              </h2>

              <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
                Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais cadastrados serão permanentemente apagados e você perderá o acesso à conta.
              </p>

              {userRole === "ong" && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                  Organizações com repasses financeiros pendentes precisam aguardar a conclusão das transferências antes de solicitar a exclusão.
                </p>
              )}

              {/* Form */}
              <form onSubmit={handleDeleteAccount} className="space-y-4 mt-6">
                {/* Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Sua senha atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                      disabled={isDeleting}
                      className="w-full px-4 py-3 pr-11 text-base text-gray-900 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 2FA se ativo */}
                {showTwoFactor ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Código de 2 fatores (2FA)
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\s/g, ""))}
                      placeholder="Código de 6 dígitos"
                      disabled={isDeleting}
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-mono tracking-widest placeholder:text-gray-400"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTwoFactor(true)}
                    className="text-xs text-gray-500 hover:text-gray-900 underline flex items-center gap-1.5 font-medium"
                  >
                    <KeyRound size={13} /> Tenho autenticação de 2 fatores ativada
                  </button>
                )}

                {/* Frase de confirmação */}
                <div className="pt-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Digite exatamente a frase abaixo:
                  </label>

                  <div
                    onClick={() => setConfirmationPhrase(REQUIRED_PHRASE)}
                    title="Clique para preencher automaticamente"
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-800 text-center select-all cursor-pointer hover:bg-gray-100 transition-colors mb-2"
                  >
                    {REQUIRED_PHRASE}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={confirmationPhrase}
                      onChange={(e) => setConfirmationPhrase(e.target.value)}
                      placeholder="Digite a frase para confirmar"
                      required
                      disabled={isDeleting}
                      className={`w-full px-4 py-3 text-sm sm:text-base rounded-xl outline-none transition-all ${
                        isPhraseValid
                          ? "border-2 border-emerald-500 bg-emerald-50/30 text-emerald-950"
                          : "border border-gray-200 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                    {isPhraseValid && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-600">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isDeleting}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      "Excluir conta"
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
