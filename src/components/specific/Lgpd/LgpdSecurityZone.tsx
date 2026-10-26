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
      <div className="pt-6 mt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-lg">
            <h4 className="text-lg font-bold text-gray-900">
              Encerrar conta
            </h4>
            <p className="text-base text-gray-700 mt-1 leading-relaxed">
              Exclua permanentemente sua conta e todos os seus dados pessoais do DoeCerto conforme a LGPD. Esta ação não poderá ser desfeita.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
          >
            <Trash2 size={16} />
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
