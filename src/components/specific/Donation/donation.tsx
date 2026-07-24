"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, HeartHandshake, Plus } from "lucide-react";
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
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-4 min-h-screen pb-24 bg-gray-50/30 relative">
      <button
        type="button"
        onClick={onCancel || (() => router.back())}
        className="fixed top-4 left-4 bg-white p-2.5 rounded-full z-30 shadow-sm border border-gray-100 text-gray-700 hover:text-[#6B39A7] transition-all"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="mb-8 mt-12 px-1">
        <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-black uppercase px-3 py-1.5 rounded-full mb-3 md:text-xs">
          <HeartHandshake
            size={12}
            className="animate-pulse md:w-3.5 md:h-3.5"
          />{" "}
          Doação Material
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-[#2e134d]">
          {ongName}
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Selecione os itens abaixo para compor a sua doação.
        </p>
      </div>

      <MissingPhoneAlert
        visible={!fetchingData && !hasPhone}
        onGoToProfile={() => router.push("/profile/edit")}
      />

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start ${!hasPhone && !fetchingData ? "opacity-40 pointer-events-none select-none" : ""}`}
      >
        <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(107,57,167,0.05)] border border-gray-100 p-6 md:p-8 flex flex-col gap-4 md:gap-5 relative">
          <h2 className="text-xs md:text-sm font-black text-purple-600 uppercase tracking-widest flex items-center gap-1.5">
            <ClipboardList size={14} className="md:w-4 md:h-4" /> Adicionar Item
          </h2>

          <CustomDropdown
            items={itemsCadastrados}
            selectedValue={selectedItemId}
            onSelect={setSelectedItemId}
            disabled={fetchingData || !hasPhone}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold text-xs md:text-sm text-gray-500 uppercase ml-1">
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
              className="w-full p-3.5 md:p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/70 text-gray-700 font-bold text-sm md:text-base focus:border-[#6B39A7] focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold text-xs md:text-sm text-gray-500 uppercase ml-1">
              Descrição e Detalhes
            </label>
            <textarea
              rows={2}
              value={descricaoAdicional}
              onChange={(e) => setDescricaoAdicional(e.target.value)}
              disabled={fetchingData || !hasPhone}
              placeholder="Estado, validade, tamanho..."
              className="w-full p-3.5 md:p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/70 text-gray-700 text-sm md:text-base focus:border-[#6B39A7] focus:bg-white outline-none transition-all resize-none"
            />
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
            className="mt-1 w-full bg-gradient-to-r from-purple-50 to-indigo-50 text-[#6B39A7] font-black py-3.5 md:py-4 rounded-2xl border border-purple-100/80 flex items-center justify-center gap-2 disabled:opacity-40 text-sm md:text-base"
          >
            <Plus
              size={16}
              strokeWidth={3}
              className="md:w-[18px] md:h-[18px]"
            />
            Incluir na Lista
          </button>
        </div>

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

      {showReview && !isSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md md:max-w-lg">
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
