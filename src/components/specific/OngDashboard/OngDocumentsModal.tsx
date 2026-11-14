"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  FileCheck,
  FileText,
  CheckCircle2,
  Loader2,
  ShieldCheck,
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

function formatCpf(value: string): string {
  const raw = value.replace(/\D/g, "").slice(0, 11);
  if (raw.length <= 3) return raw;
  if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
  if (raw.length <= 9) {
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
  }
  return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
}

export function OngDocumentsModal({
  isOpen,
  onClose,
  ong,
  onSuccess,
}: OngDocumentsModalProps) {
  const [presidentName, setPresidentName] = useState(ong?.presidentName || "");
  const [presidentCpf, setPresidentCpf] = useState(() =>
    formatCpf(ong?.presidentCpf || ""),
  );

  const [estatutoFile, setEstatutoFile] = useState<File | null>(null);
  const [ataFile, setAtaFile] = useState<File | null>(null);
  const [cartaoCnpjFile, setCartaoCnpjFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPresidentName(ong?.presidentName || "");
    setPresidentCpf(formatCpf(ong?.presidentCpf || ""));
    setEstatutoFile(null);
    setAtaFile(null);
    setCartaoCnpjFile(null);
  }, [isOpen, ong?.presidentName, ong?.presidentCpf]);

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

  const documentRows = [
    {
      key: "estatuto",
      title: "Estatuto Social Registrado *",
      uploaded: Boolean(ong?.hasEstatuto),
      file: estatutoFile,
      onFileSelect: setEstatutoFile,
      defaultSubtitle: "Formato PDF ou imagem (PNG/JPG até 10MB)",
    },
    {
      key: "ata",
      title: "Ata de Eleição Vigente *",
      uploaded: Boolean(ong?.hasAta),
      file: ataFile,
      onFileSelect: setAtaFile,
      defaultSubtitle: "Última ata de posse da diretoria (PDF/Imagem até 10MB)",
    },
    {
      key: "cartaoCnpj",
      title: "Cartão CNPJ (Opcional)",
      uploaded: Boolean(ong?.hasCartaoCnpj),
      file: cartaoCnpjFile,
      onFileSelect: setCartaoCnpjFile,
      defaultSubtitle: "Comprovante de Inscrição e Situação Cadastral",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8 border border-gray-100 overflow-hidden text-gray-900"
        >
          {/* Cabeçalho */}
          <div className="p-6 sm:p-7 border-b border-gray-100 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center shrink-0">
                <ShieldCheck size={28} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  Documentação para Homologação Bancária
                </h2>
                <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                  Ativação da subconta no gateway de pagamentos (Asaas)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Fechar"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Corpo */}
          <div className="p-6 sm:p-7 space-y-6">
            <p className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-sm sm:text-base text-purple-950 font-medium leading-relaxed">
              Para que sua instituição possa receber doações Pix com repasse direto, o Banco Central e o gateway exigem a comprovação societária (Estatuto Social e Ata vigente).
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Presidente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-bold text-gray-800 mb-2">
                    Nome do presidente / Repr. legal *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      value={presidentName}
                      onChange={(e) => setPresidentName(e.target.value)}
                      placeholder="Nome completo conforme RG/CPF"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#6B39A7] focus:ring-2 focus:ring-[#6B39A7]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold text-gray-800 mb-2">
                    CPF do presidente *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={14}
                      value={presidentCpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#6B39A7] focus:ring-2 focus:ring-[#6B39A7]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Anexos */}
              <div className="space-y-3.5">
                {documentRows.map((doc) => {
                  const hasAnyFile = Boolean(doc.file || doc.uploaded);
                  return (
                    <div
                      key={doc.key}
                      className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        doc.file
                          ? "bg-purple-50/40 border-purple-200"
                          : "bg-gray-50/70 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            doc.file
                              ? "bg-purple-100 text-[#6B39A7]"
                              : doc.uploaded
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#F3E8FF] text-[#6B39A7]"
                          }`}
                        >
                          {doc.file ? <FileCheck size={20} /> : <FileText size={20} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                              {doc.title}
                            </span>
                            {doc.file ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B39A7] bg-purple-100 px-2.5 py-0.5 rounded-full">
                                <FileCheck size={13} /> Novo arquivo
                              </span>
                            ) : doc.uploaded ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 size={13} /> Enviado
                              </span>
                            ) : null}
                          </div>
                          <p
                            className="text-sm text-gray-600 font-medium mt-1 truncate"
                            title={doc.file ? doc.file.name : doc.defaultSubtitle}
                          >
                            {doc.file ? doc.file.name : doc.defaultSubtitle}
                          </p>
                        </div>
                      </div>

                      <label
                        className={`shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 bg-white border border-gray-300 hover:border-[#6B39A7] hover:bg-purple-50/50 rounded-xl text-sm font-bold text-gray-800 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] ${
                          loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
                        }`}
                      >
                        <UploadCloud size={18} className="text-[#6B39A7]" />
                        <span>{hasAnyFile ? "Substituir arquivo" : "Selecionar arquivo"}</span>
                        <input
                          type="file"
                          disabled={loading}
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) doc.onFileSelect(selected);
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Ações */}
              <div className="pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#6B39A7] hover:bg-[#582d8c] text-white text-base font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Enviando documentos...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={20} />
                      <span>Salvar e Enviar para Homologação</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
