"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Donation, { DonationData } from "../../components/specific/Donation/donation";
import { DonationService } from "@/services/donations.service";
import { CheckCircle2 } from "lucide-react";

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
        <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-slate-900/40 px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center border border-gray-100 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-50 text-emerald-600">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Doação enviada!
            </h2>

            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-medium">
              A ONG <strong className="font-bold text-slate-800">{ongName}</strong> recebeu sua intenção de doação e entrará em contato.
            </p>

            <button
              onClick={() => router.push("/home")}
              className="w-full bg-[#6B39A7] hover:bg-[#5b2f8e] text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
