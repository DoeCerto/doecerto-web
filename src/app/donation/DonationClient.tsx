"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Donation, { DonationData } from "../../components/specific/Donation/donation";
import { DonationService } from "@/services/donations.service";

export default function DonationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ongName = searchParams?.get("ong") || "ONG Selecionada";
  const ongIdParam = searchParams?.get("ongId");
  const ongId = ongIdParam ? Number(ongIdParam) : null;


  const handleSubmit = async (data: DonationData) => {
    if (!ongId) {
      alert("Erro: ID da ONG não encontrado.");
      return;
    }

    try {
      
      await DonationService.createMaterialDonation(ongId, {
        wishlistItemId: null,
        quantity: data.quantidade,
        description: data.descricao,
      });

      
    } catch (error: any) {
      console.error("Erro na Doação:", error.message);
      alert("Não foi possível enviar a doação. Tente novamente mais tarde.");
      throw error; 
    }
  };

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
    <div className="relative min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center justify-center">
      <Donation
        ongId={ongId}
        ongName={ongName}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}