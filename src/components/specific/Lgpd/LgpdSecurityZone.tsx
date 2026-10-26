"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { LgpdDeleteAccountModal } from "./LgpdDeleteAccountModal";

interface LgpdSecurityZoneProps {
  userRole?: "donor" | "ong" | string;
  userName?: string;
}

export function LgpdSecurityZone({ userRole = "donor" }: LgpdSecurityZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="pt-10 mt-10 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h4 className="text-xl sm:text-2xl font-black text-gray-900">
              Encerrar conta
            </h4>
            <p className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
              Exclua permanentemente sua conta e todos os seus dados pessoais do DoeCerto conforme a LGPD. Esta ação não poderá ser desfeita.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-bold text-red-600 hover:text-white bg-white hover:bg-red-600 border-2 border-red-200 hover:border-red-600 transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
          >
            <Trash2 size={18} />
            Excluir conta
          </button>
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
