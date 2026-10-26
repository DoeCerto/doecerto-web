"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Loader2,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { LgpdService, downloadJsonFile } from "@/services/lgpd.service";
import { LgpdDeleteAccountModal } from "./LgpdDeleteAccountModal";

interface LgpdSecurityZoneProps {
  userRole?: "donor" | "ong" | string;
  userName?: string;
}

export function LgpdSecurityZone({ userRole = "donor", userName }: LgpdSecurityZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await LgpdService.exportUserData();
      const sanitizedName = (userName || "usuario")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const filename = `doecerto_lgpd_${sanitizedName}_${new Date().toISOString().split("T")[0]}.json`;

      downloadJsonFile(data, filename);
      toast.success("Relatório de dados exportado com sucesso!", {
        icon: "📁",
      });
    } catch (error: any) {
      console.error("Erro ao exportar dados LGPD:", error);
      toast.error(
        error?.message || "Erro ao exportar seus dados pessoais. Tente novamente."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="mt-8 pt-8 border-t border-slate-200/80">
        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6B39A7]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Privacidade & Dados Pessoais
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#6B39A7] tracking-wider">
                  LGPD
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie seus direitos de titular e a permanência dos seus dados na plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Ações Fintech */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Portabilidade de Dados (Art. 18, II e V) */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#6B39A7]" /> Portabilidade
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Formato Aberto (.JSON)
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Exportar Meus Dados
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Baixe uma cópia integral estruturada de todo o seu histórico, perfil, doações e consentimentos conforme o Art. 18 da LGPD.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin text-[#6B39A7]" />
                  Gerando arquivo seguro...
                </>
              ) : (
                <>
                  <Download size={14} className="text-[#6B39A7]" />
                  Baixar Meus Dados Pessoais
                </>
              )}
            </button>
          </motion.div>

          {/* Card 2: Exclusão e Anonimização (Art. 18, VI) */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 bg-gradient-to-br from-white via-red-50/20 to-rose-50/30 rounded-2xl border border-red-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Zona de Perigo
                </span>
                <span className="text-[11px] text-red-700 font-semibold bg-red-100/80 px-2 py-0.5 rounded-full border border-red-200">
                  Irreversível
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Excluir Minha Conta
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Solicite o encerramento da conta e o expurgo/anonimização permanente de seus dados pessoais em total conformidade com a LGPD.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer group"
            >
              <Trash2 size={14} className="text-red-500 group-hover:text-white transition-colors" />
              Iniciar Exclusão Definitiva
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modal de Confirmação Segura */}
      <LgpdDeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
