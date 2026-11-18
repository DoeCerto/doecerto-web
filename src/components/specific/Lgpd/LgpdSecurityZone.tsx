"use client";

import React, { useState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { LgpdService, downloadJsonFile } from "@/services/lgpd.service";
import { LgpdDeleteAccountModal } from "./LgpdDeleteAccountModal";

interface LgpdSecurityZoneProps {
  userRole?: "donor" | "ong" | string;
  userName?: string;
  className?: string;
}

export function LgpdSecurityZone({ userRole = "donor", className }: LgpdSecurityZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const data = await LgpdService.exportUserData();
      downloadJsonFile(data, "meus-dados-doecerto-lgpd.json");
      toast.success("Seus dados foram exportados em JSON.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      toast.error(message || "Não foi possível exportar seus dados. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={className ?? "pt-6 mt-6 border-t border-gray-100"}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                Exportar meus dados (LGPD)
              </h4>
              <p className="text-base sm:text-lg text-gray-700 mt-1 leading-relaxed font-normal">
                Baixe uma cópia estruturada em JSON de todos os seus dados pessoais, registros de consentimento e histórico vinculado à sua conta.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold text-[#6B39A7] hover:text-white bg-white hover:bg-[#6B39A7] border border-[#6B39A7]/30 hover:border-[#6B39A7] transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isExporting ? "Exportando..." : "Exportar Meus Dados (JSON)"}
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                Encerrar conta
              </h4>
              <p className="text-base sm:text-lg text-gray-700 mt-1 leading-relaxed font-normal">
                Exclua permanentemente sua conta e todos os seus dados pessoais do DoeCerto conforme a LGPD. Esta ação não poderá ser desfeita.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
            >
              <Trash2 size={18} />
              Excluir conta
            </button>
          </div>
        </div>
      </div>

      <LgpdDeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
