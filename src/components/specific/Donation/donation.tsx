"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PhoneOff } from "lucide-react";
import { WishlistService } from "@/services/wishlist.service";
import { DonorService, DonorProfileData } from "@/services/donor.service";

export interface DonationData {
  tipoItem: string;
  quantidade: number;
  descricao: string;
}

export interface DonationProps {
  ongId: number;
  ongName?: string;
  onSubmit?: (data: DonationData) => Promise<void> | void;
  onCancel?: () => void;
}

export default function Donation({
  ongId,
  ongName = "ONG Selecionada",
  onSubmit,
  onCancel,
}: DonationProps) {
  const [itemsCadastrados, setItemsCadastrados] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<DonorProfileData | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [descricaoAdicional, setDescricaoAdicional] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    async function loadInitialData() {
      try {
        setFetchingData(true);
        const [items, profile] = await Promise.all([
          WishlistService.getItems(ongId),
          DonorService.getMyProfile() 
        ]);
        
        setItemsCadastrados(items || []);
        setUserProfile(profile);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      } finally {
        setFetchingData(false);
      }
    }
    if (ongId) loadInitialData();
  }, [ongId]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();


    if (!userProfile?.phone) {
      alert("Para realizar uma doação, você precisa cadastrar um telefone de contato no seu perfil.");
      router.push("/profile/edit"); 
      return;
    }

    if (!selectedItemId || !quantidade || !descricaoAdicional) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const itemDaLista = itemsCadastrados.find(i => i.id.toString() === selectedItemId);
    
    const descricaoFinal = itemDaLista 
      ? `${itemDaLista.description} - ${descricaoAdicional}`
      : descricaoAdicional;

    const payload: DonationData = {
      tipoItem: "material", 
      quantidade: Number(quantidade),
      descricao: descricaoFinal,
    };

    try {
      setLoading(true);
      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const hasPhone = !!userProfile?.phone;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <button
        type="button"
        onClick={onCancel || (() => router.back())}
        className="fixed top-4 left-4 bg-white/90 p-2 rounded-full z-30 shadow-md text-gray-900 hover:bg-white transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="mb-6 mt-12">
        <h1 className="text-2xl font-black text-[#6B39A7]">{`Doar Itens — ${ongName}`}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Selecione uma necessidade da ONG e descreva sua doação.
        </p>
      </div>

      {/* Alerta Visual de Telefone Faltando */}
      {!fetchingData && !hasPhone && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <PhoneOff className="text-red-500 shrink-0" size={20} />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-red-800">Telefone não encontrado</p>
            <p className="text-xs text-red-700">
              A ONG precisa do seu contato para combinar a entrega dos itens.
            </p>
            <button 
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-black text-red-900 underline w-fit"
            >
              Completar meu perfil agora
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-[24px] shadow-xl border border-gray-100 p-6 flex flex-col gap-5 ${!hasPhone && !fetchingData ? 'opacity-75' : ''}`}
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-sm text-gray-700 ml-1">O que você vai doar?</label>
          <div className="relative">
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
              disabled={fetchingData || !hasPhone}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-50 outline-none transition-all appearance-none disabled:opacity-50"
            >
              <option value="">Selecione o item</option>
              {itemsCadastrados.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.description}
                </option>
              ))}
              <option value="Outros">Outros (Item não listado)</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-sm text-gray-700 ml-1">Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
            required
            disabled={fetchingData || !hasPhone}
            placeholder="Ex: 10"
            className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-50 outline-none transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-sm text-gray-700 ml-1">Descrição dos Itens</label>
          <textarea
            rows={4}
            value={descricaoAdicional}
            onChange={(e) => setDescricaoAdicional(e.target.value)}
            required
            disabled={fetchingData || !hasPhone}
            placeholder="Conte-nos mais (ex: estado de conservação, validade...)"
            className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-50 outline-none transition-all resize-none disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button
            type="submit"
            disabled={loading || fetchingData || !hasPhone}
            className="bg-[#6B39A7] hover:bg-[#3a1661] text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-100 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Processando..." : "Confirmar Doação"}
          </button>

          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
