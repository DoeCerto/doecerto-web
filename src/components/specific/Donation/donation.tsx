"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Plus, Package } from "lucide-react";
import { WishlistService } from "@/services/wishlist.service";
import { DonorService, DonorProfileData } from "@/services/donor.service";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { MissingPhoneAlert } from "@/components/ui/MissingPhoneAlert";
import { DonationItemsList } from "@/components/ui/DonationItemsList";
import { ConfirmationCard } from "@/components/ui/ConfirmationCard";
import { SuccessModal } from "@/components/ui/SuccessModal";

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

export interface ListaItem {
  itemId: string;
  itemName: string;
  quantidade: number;
  detalhes: string;
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
  const [listaEnvio, setListaEnvio] = useState<ListaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadInitialData() {
      try {
        setFetchingData(true);
        const [items, profile] = await Promise.all([
          WishlistService.getItems(ongId),
          DonorService.getMyProfile(),
        ]);
        setItemsCadastrados(items || []);
        setUserProfile(profile);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setFetchingData(false);
      }
    }
    if (ongId) loadInitialData();
  }, [ongId]);

  const handleAddItem = () => {
    const qty = Number(quantidade);
    if (!selectedItemId || qty <= 0 || !descricaoAdicional.trim()) return;

    const itemDaLista = itemsCadastrados.find(
      (i) => i.id.toString() === selectedItemId,
    );
    const itemName = itemDaLista
      ? itemDaLista.description
      : "Outros (Item não listado)";

    setListaEnvio([
      ...listaEnvio,
      {
        itemId: selectedItemId,
        itemName,
        quantidade: Number(quantidade),
        detalhes: descricaoAdicional.trim(),
      },
    ]);
    setSelectedItemId("");
    setQuantidade("");
    setDescricaoAdicional("");
  };

  const handleOpenReview = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!listaEnvio.length) return;
    setShowReview(true);
  };

  const handleExecuteSubmit = async () => {
    const payload: DonationData = {
      tipoItem: "material",
      quantidade: listaEnvio.reduce((acc, item) => acc + item.quantidade, 0),
      descricao: listaEnvio
        .map((i) => `${i.quantidade}x ${i.itemName} (${i.detalhes})`)
        .join(", "),
    };

    try {
      setLoading(true);
      if (onSubmit) await onSubmit(payload);
      setIsSuccess(true);
      setShowReview(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasPhone = !!userProfile?.phone;
  const totalItens = listaEnvio.reduce((acc, item) => acc + item.quantidade, 0);
  const resumoItens = listaEnvio
    .map((i) => `${i.quantidade}x ${i.itemName}`)
    .join(", ");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-purple-600 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="flex items-center text-slate-500 hover:text-purple-700 font-bold transition-colors group w-fit active:scale-95 cursor-pointer mb-8 sm:mb-10"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-sm border border-blue-100">
            <Package size={14} /> Doação de Materiais
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
            {ongName}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl">
            Selecione e descreva os itens abaixo para compor a sua doação.
          </p>
        </div>

        <MissingPhoneAlert
          visible={!fetchingData && !hasPhone}
          onGoToProfile={() => router.push("/profile/edit")}
        />

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start ${!hasPhone && !fetchingData ? "opacity-40 pointer-events-none select-none" : ""}`}>
          
          <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-6 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <ClipboardList size={20} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Adicionar Novo Item</h2>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Selecione o Item
              </label>
              <CustomDropdown
                items={itemsCadastrados}
                selectedValue={selectedItemId}
                onSelect={setSelectedItemId}
                disabled={fetchingData || !hasPhone}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 sm:col-span-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantidade(val === "" ? "" : Math.max(1, Number(val)));
                  }}
                  disabled={fetchingData || !hasPhone}
                  placeholder="Ex: 5"
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-base focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Descrição ou Detalhes
                </label>
                <textarea
                  rows={1}
                  value={descricaoAdicional}
                  onChange={(e) => setDescricaoAdicional(e.target.value)}
                  disabled={fetchingData || !hasPhone}
                  placeholder="Ex: Roupas de frio infantis, tamanho M..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-base focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none overflow-hidden"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              disabled={
                !selectedItemId ||
                quantidade === "" ||
                quantidade <= 0 ||
                !descricaoAdicional.trim()
              }
              className="mt-2 w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-black py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={3} />
              Incluir na Lista
            </button>
          </div>

          <div className="lg:col-span-5">
            <DonationItemsList
              listaEnvio={listaEnvio}
              onRemove={(index) =>
                setListaEnvio(listaEnvio.filter((_, i) => i !== index))
              }
              onSubmit={handleOpenReview}
              loading={loading}
              disabled={fetchingData || !hasPhone}
              onCancel={onCancel}
            />
          </div>
        </div>
      </div>

      {showReview && !isSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <ConfirmationCard
              type="material"
              title="Revisar dados do envio"
              amountOrQuantity={`${totalItens} ${totalItens === 1 ? "Item selecionado" : "Itens selecionados"}`}
              detailsLabel={`Confirma o envio para a ${ongName}?`}
              detailsText={resumoItens}
              primaryButtonText={loading ? "Enviando..." : "Confirmar e Enviar"}
              onPrimaryAction={handleExecuteSubmit}
              secondaryButtonText="Voltar e Alterar"
              onSecondaryAction={() => setShowReview(false)}
            />
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={isSuccess}
        title="Doação enviada!"
        description={`A ONG ${ongName} recebeu sua intenção de doação de materiais e entrará em contato.`}
        homePath="/home"
        onResetFlow={() => {
          setListaEnvio([]);
          setIsSuccess(false);
        }}
      />
    </div>
  );
}