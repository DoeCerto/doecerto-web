"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  CheckCircle2,
  Pencil,
  Copy,
  Search,
  Loader2,
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { BankAccountData, BankAccountService } from "@/services/bank-account.service";
import { lookupPixKey, PixKeyLookupResult } from "@/services/register-ong.service";

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const err = error as {
      data?: { message?: string | string[] };
      message?: string | string[];
    };
    const raw = err.data?.message ?? err.message;
    if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);
    if (typeof raw === "string" && raw.trim()) return raw;
  }
  return fallback;
}

interface OngBankAccountCardProps {
  bankAccount: BankAccountData | null;
  ongCnpj?: string | null;
  ongName?: string | null;
  loading?: boolean;
  onAccountUpdated: (account: BankAccountData | null) => void;
}

export function OngBankAccountCard({
  bankAccount,
  ongCnpj,
  ongName,
  loading = false,
  onAccountUpdated,
}: OngBankAccountCardProps) {
  const [copiedPix, setCopiedPix] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pixKeyInput, setPixKeyInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const [lookingUpDict, setLookingUpDict] = useState(false);
  const [dictPreview, setDictPreview] = useState<PixKeyLookupResult | null>(null);
  const [dictError, setDictError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cleanCnpj = (ongCnpj || "").replace(/\D/g, "");

  const openModal = () => {
    setPixKeyInput(bankAccount?.pixKey || "");
    setCurrentPassword("");
    setTwoFactorCode("");
    setNeedsTwoFactor(false);
    setDictPreview(null);
    setDictError(null);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleCopyPix = () => {
    if (!bankAccount?.pixKey) return;
    navigator.clipboard.writeText(bankAccount.pixKey).then(() => {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    });
  };

  const handleDictLookup = async () => {
    const trimmed = pixKeyInput.trim();
    if (!trimmed) {
      setDictError("Digite a nova chave Pix para consultar via DICT.");
      return;
    }
    if (cleanCnpj.length !== 14) {
      setDictError("CNPJ da ONG não disponível para consulta prévia. Você pode salvar diretamente para validar no servidor.");
      return;
    }

    setLookingUpDict(true);
    setDictError(null);
    setDictPreview(null);
    try {
      const result = await lookupPixKey(trimmed, cleanCnpj);
      setDictPreview(result);
      if (!result.validFormat) {
        setDictError(result.reason || "Formato de chave Pix inválido.");
      } else if (result.lookupAvailable && !result.found) {
        setDictError(result.reason || "Chave Pix não encontrada no diretório DICT.");
      }
    } catch (error: unknown) {
      setDictError(
        extractApiErrorMessage(error, "Não foi possível consultar a chave no DICT."),
      );
    } finally {
      setLookingUpDict(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPix = pixKeyInput.trim();
    const trimmedPassword = currentPassword.trim();
    const trimmed2fa = twoFactorCode.trim();

    if (!trimmedPix) {
      setSubmitError("Informe a chave Pix de repasse.");
      return;
    }
    if (!trimmedPassword) {
      setSubmitError("Informe sua senha atual para confirmar esta alteração.");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await BankAccountService.saveAccount({
        pixKey: trimmedPix,
        currentPassword: trimmedPassword,
        ...(trimmed2fa ? { twoFactorCode: trimmed2fa } : {}),
      });

      const refreshed = await BankAccountService.getMyAccount();
      onAccountUpdated(refreshed);
      toast.success("Chave Pix e dados bancários atualizados com segurança!");
      setIsModalOpen(false);
    } catch (error: unknown) {
      const msg = extractApiErrorMessage(error, "Não foi possível salvar a chave Pix.");
      if (/2fa|two-?factor|dois fatores|c[oó]digo.*autentica/i.test(msg)) {
        setNeedsTwoFactor(true);
      }
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const hasDictDetails = Boolean(
    bankAccount?.bankName || bankAccount?.bankCode || bankAccount?.ispb || bankAccount?.pixKeyOwnerName,
  );

  return (
    <>
      <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B39A7] flex items-center justify-center shrink-0">
              <Landmark size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#6B39A7]">
                  Dados Bancários & Pix
                </h2>
                {hasDictDetails && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <CheckCircle2 size={12} />
                    Verificado via DICT
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Conta vinculada automaticamente à chave Pix de repasses da ONG.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6B39A7] font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <Pencil size={15} />
            <span>{bankAccount?.pixKey ? "Atualizar Chave Pix" : "Cadastrar Chave Pix"}</span>
          </button>
        </div>

        {loading && !bankAccount ? (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : bankAccount && bankAccount.pixKey ? (
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Banco
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate" title={bankAccount.bankName || undefined}>
                {bankAccount.bankName || "Banco vinculado"}
                {bankAccount.bankCode ? ` (${bankAccount.bankCode})` : ""}
              </p>
              {bankAccount.ispb && (
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  ISPB {bankAccount.ispb}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Agência e Conta
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {bankAccount.agencyNumber || bankAccount.accountNumber
                  ? `Ag. ${bankAccount.agencyNumber || "—"} • Cc. ${bankAccount.accountNumber || "—"}`
                  : "Via DICT"}
              </p>
              {bankAccount.accountType && (
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  Conta {bankAccount.accountType}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Titular (DICT)
              </span>
              <p
                className="text-sm font-bold text-slate-800 mt-1 truncate"
                title={bankAccount.pixKeyOwnerName || ongName || undefined}
              >
                {bankAccount.pixKeyOwnerName || ongName || "Titular não informado"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6B39A7] block">
                  Chave Pix
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate font-mono" title={bankAccount.pixKey}>
                  {bankAccount.pixKey}
                </p>
                {bankAccount.pixKeyUpdatedAt && (
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    Atualizada em {new Date(bankAccount.pixKeyUpdatedAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyPix}
                title="Copiar Chave Pix"
                className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer shrink-0"
              >
                {copiedPix ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-amber-900 font-medium">
              Nenhuma chave Pix vinculada ainda. Cadastre sua chave Pix para consultar os dados bancários via DICT e receber repasses.
            </p>
          </div>
        )}
      </div>

      {/* Modal Seguro de Atualização da Chave Pix */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100"
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {bankAccount?.pixKey ? "Atualizar Chave Pix" : "Cadastrar Chave Pix"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Os dados bancários são preenchidos automaticamente via DICT.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Nova Chave Pix *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixKeyInput}
                      onChange={(e) => {
                        setPixKeyInput(e.target.value);
                        setDictPreview(null);
                        setDictError(null);
                      }}
                      placeholder="CNPJ, e-mail, celular (+55...) ou chave aleatória"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#6B39A7] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleDictLookup}
                      disabled={lookingUpDict || !pixKeyInput.trim()}
                      className="px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6B39A7] font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                      {lookingUpDict ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                      <span>Consultar DICT</span>
                    </button>
                  </div>
                </div>

                {dictError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>{dictError}</span>
                  </div>
                )}

                {dictPreview && dictPreview.found && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Chave localizada no DICT ({dictPreview.keyType})
                      </span>
                      {dictPreview.ownerMatchesCnpj === true && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 font-bold text-[10px]">
                          CNPJ compatível
                        </span>
                      )}
                      {dictPreview.ownerMatchesCnpj === false && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                          Titular diferente do CNPJ
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-semibold">
                      {dictPreview.bankName || "Banco"} {dictPreview.bankCode ? `(${dictPreview.bankCode})` : ""}
                      {dictPreview.agencyNumber ? ` • Ag. ${dictPreview.agencyNumber}` : ""}
                      {dictPreview.accountNumber ? ` • Cc. ${dictPreview.accountNumber}` : ""}
                    </p>
                    {dictPreview.ownerName && (
                      <p className="text-slate-600">Titular: <strong>{dictPreview.ownerName}</strong></p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-purple-700 block mb-1.5">
                    Sua Senha Atual *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Confirme sua senha atual"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 outline-none focus:border-[#6B39A7] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#6B39A7] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Código 2FA {needsTwoFactor ? <span className="text-red-500">* (Obrigatório)</span> : "(opcional, se ativado)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:bg-white transition-all tracking-widest font-mono ${
                        needsTwoFactor
                          ? "border-amber-400 focus:border-[#6B39A7]"
                          : "border-slate-200 focus:border-[#6B39A7]"
                      }`}
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="sm:w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="sm:w-2/3 py-3 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-sm shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    <span>{saving ? "Validando..." : "Salvar Chave Pix"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
