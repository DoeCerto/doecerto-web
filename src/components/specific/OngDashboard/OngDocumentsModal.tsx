"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building,
  User,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { OngsProfileService } from "@/services/ongs-profile.service";

interface OngDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ong: any;
  onSuccess: (updatedData: any) => void;
}

export function OngDocumentsModal({
  isOpen,
  onClose,
  ong,
  onSuccess,
}: OngDocumentsModalProps) {
  const [presidentName, setPresidentName] = useState(ong?.presidentName || "");
  const [presidentCpf, setPresidentCpf] = useState(ong?.presidentCpf || "");

  const [estatutoFile, setEstatutoFile] = useState<File | null>(null);
  const [ataFile, setAtaFile] = useState<File | null>(null);
  const [cartaoCnpjFile, setCartaoCnpjFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const formatCpf = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    if (raw.length <= 9)
      return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPresidentCpf(formatCpf(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!presidentName.trim()) {
      toast.error("Informe o nome do Presidente / Representante Legal.");
      return;
    }

    const cleanCpf = presidentCpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast.error("Informe um CPF válido para o representante legal (11 dígitos).");
      return;
    }

    if (!ong?.hasEstatuto && !estatutoFile) {
      toast.error("É obrigatório anexar o Estatuto Social.");
      return;
    }

    if (!ong?.hasAta && !ataFile) {
      toast.error("É obrigatório anexar a Ata de Eleição da Diretoria.");
      return;
    }

    const formData = new FormData();
    formData.append("presidentName", presidentName.trim());
    formData.append("presidentCpf", cleanCpf);

    if (estatutoFile) formData.append("estatuto", estatutoFile);
    if (ataFile) formData.append("ata", ataFile);
    if (cartaoCnpjFile) formData.append("cartaoCnpj", cartaoCnpjFile);

    try {
      setLoading(true);
      const res = await OngsProfileService.uploadDocuments(formData);
      toast.success("Documentação enviada com sucesso para homologação!");
      onSuccess(res?.data?.ong || res?.data);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || "Erro ao enviar documentos. Verifique o tamanho e formato dos arquivos."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 border border-slate-100 overflow-hidden text-slate-800"
        >
          {/* Botão de Fechar */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Cabeçalho */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0">
              <ShieldCheck size={26} strokeWidth={2.3} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Documentação para Homologação Bancária
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Ativação da subconta no gateway de pagamentos (Asaas)
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed bg-purple-50/70 border border-purple-100/80 p-3.5 rounded-2xl">
            Para que sua instituição possa receber doações Pix com repasse direto, o Banco Central e o gateway exigem a comprovação societária (Estatuto Social e Ata vigente).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dados do Presidente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Presidente / Repr. Legal *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    value={presidentName}
                    onChange={(e) => setPresidentName(e.target.value)}
                    placeholder="Nome completo conforme RG/CPF"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#6B39A7] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CPF do Presidente *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={presidentCpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#6B39A7] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Anexos */}
            <div className="space-y-3 pt-2">
              {/* Estatuto Social */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Estatuto Social Registrado *</span>
                    {ong?.hasEstatuto && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Enviado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {estatutoFile ? estatutoFile.name : "Formato PDF ou imagem (PNG/JPG até 10MB)"}
                  </p>
                </div>
                <label className="shrink-0 cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:border-[#6B39A7] hover:bg-purple-50/50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2 shadow-sm">
                  <UploadCloud size={15} className="text-[#6B39A7]" />
                  <span>{estatutoFile || ong?.hasEstatuto ? "Substituir arquivo" : "Selecionar PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setEstatutoFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>

              {/* Ata de Eleição */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Ata de Eleição Vigente *</span>
                    {ong?.hasAta && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Enviado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {ataFile ? ataFile.name : "Última ata de posse da diretoria (PDF/Imagem até 10MB)"}
                  </p>
                </div>
                <label className="shrink-0 cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:border-[#6B39A7] hover:bg-purple-50/50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2 shadow-sm">
                  <UploadCloud size={15} className="text-[#6B39A7]" />
                  <span>{ataFile || ong?.hasAta ? "Substituir arquivo" : "Selecionar PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setAtaFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>

              {/* Cartão CNPJ (Opcional) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Cartão CNPJ (Opcional)</span>
                    {ong?.hasCartaoCnpj && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Enviado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {cartaoCnpjFile ? cartaoCnpjFile.name : "Comprovante de Inscrição e Situação Cadastral"}
                  </p>
                </div>
                <label className="shrink-0 cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:border-[#6B39A7] hover:bg-purple-50/50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2 shadow-sm">
                  <UploadCloud size={15} className="text-[#6B39A7]" />
                  <span>{cartaoCnpjFile || ong?.hasCartaoCnpj ? "Substituir arquivo" : "Selecionar PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setCartaoCnpjFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#6B39A7] hover:bg-[#582a8c] text-white text-sm font-bold rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enviando documentos...</span>
                  </>
                ) : (
                  <>
                    <FileCheck size={16} />
                    <span>Salvar e Enviar para Homologação</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
