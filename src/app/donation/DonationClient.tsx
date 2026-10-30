"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Donation, { DonationData } from "../../components/specific/Donation/donation";
import { DonationService } from "@/services/donations.service";

export default function DonationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Captura os parâmetros da URL
  const ongName = searchParams?.get("ong") || "ONG Selecionada";
  const ongIdParam = searchParams?.get("ongId");
  const ongId = ongIdParam ? Number(ongIdParam) : null;

  // 2. Função que conecta o formulário ao Backend
  const handleSubmit = async (data: DonationData) => {
    if (!ongId) {
      throw new Error("Identificador da ONG não encontrado.");
    }

    await DonationService.createMaterialDonation(ongId, {
      wishlistItemId: null,
      quantity: data.quantidade,
      description: data.descricao,
      isAnonymous: data.isAnonymous,
      guestEmail: data.guestEmail,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      acceptedTerms: data.acceptedTerms,
      turnstileToken: data.turnstileToken,
    });
  };

  // 3. Validação de Segurança
  if (!ongId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-sm text-center">
          <p className="text-gray-600 mb-4">Dados da ONG não encontrados.</p>
          <button
            onClick={() => router.push("/home")}
            className="text-[#6B39A7] font-bold underline"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Donation
        ongId={ongId}
        ongName={ongName}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
