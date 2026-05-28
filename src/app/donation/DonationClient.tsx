"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Donation, { DonationData } from "../../components/specific/Donation/donation";
import { DonationService } from "@/services/donations.service";

export default function DonationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPopup, setShowPopup] = useState(false);

  // 1. Captura os parâmetros da URL
  const ongName = searchParams?.get("ong") || "ONG Selecionada";
  const ongIdParam = searchParams?.get("ongId");
  const ongId = ongIdParam ? Number(ongIdParam) : null;

  // 2. Função que conecta o formulário ao Backend
  const handleSubmit = async (data: DonationData) => {
    if (!ongId) {
      alert("Erro: ID da ONG não encontrado.");
      return;
    }

    try {
      // Adicionamos o wishlistItemId como null para satisfazer o contrato do Service
      await DonationService.createMaterialDonation(ongId, {
        wishlistItemId: null, // <--- Adicione esta linha
        quantity: data.quantidade,
        description: data.descricao,
      });

      setShowPopup(true);
    } catch (error: any) {
      console.error("Erro na Doação:", error.message);
      alert("Não foi possível enviar a doação. Tente novamente mais tarde.");
    }
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
    <div className="relative min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center justify-center">

      {/* CORREÇÃO DO ERRO ts(2741): Passando o ongId obrigatório */}
      <Donation
        ongId={ongId}
        ongName={ongName}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />

      {/* Popup de Sucesso */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/40 px-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-[420px] text-center border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Doação enviada!
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              A ONG <span className="font-bold text-[#6B39A7]">{ongName}</span> recebeu sua intenção de doação e entrará em contato.
            </p>

            <button
              onClick={() => router.push("/home")}
              className="w-full bg-[#6B39A7] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#3a1661] transition-all"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
