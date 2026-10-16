"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, ShieldCheck,
  Building2, IdCard, Lock, Loader2, PackageOpen, Trash2,
  FileText, CheckCircle2, AlertCircle, AlertTriangle, X
} from "lucide-react";
import { WishlistService } from "@/services/wishlist.service";
import { DonorService, DonorProfileData } from "@/services/donor.service";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { MissingPhoneAlert } from "@/components/ui/MissingPhoneAlert";
import { useAuth } from "@/contexts/AuthContext";
import {
  GuestEmailModal,
  readGuestEmail,
  readGuestPhone,
  saveGuestEmail,
  saveGuestPhone,
  clearGuestEmail,
} from "./GuestEmailModal";
import { calculateImpact } from "@/utils/impactCalculator";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";

export interface DonationData {
  tipoItem: string;
  quantidade: number;
  descricao: string;
  isAnonymous?: boolean;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  acceptedTerms?: boolean;
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
  const { isAuthenticated, userRole } = useAuth();
  const isOngUser = isAuthenticated && userRole === "ong";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemsCadastrados, setItemsCadastrados] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<DonorProfileData | null>(null);
  const [ongData, setOngData] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [descricaoAdicional, setDescricaoAdicional] = useState("");
  const [listaEnvio, setListaEnvio] = useState<ListaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados de visitante e anonimato no mesmo padrão da doação monetária (Pix)
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [lastGuestEmail, setLastGuestEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    setGuestEmail(readGuestEmail());
    setGuestPhone(readGuestPhone());
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setFetchingData(true);
        const itemsPromise = WishlistService.getItems(ongId);
        const profilePromise = isAuthenticated
          ? DonorService.getMyProfile().catch(() => null)
          : Promise.resolve(null);
        const ongPromise = OngsProfileService.getPublicProfile(ongId).catch(() => null);

        const [items, profile, ongProfile] = await Promise.all([itemsPromise, profilePromise, ongPromise]);
        setItemsCadastrados(items || []);
        setUserProfile(profile);
        if (ongProfile) setOngData(ongProfile);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setFetchingData(false);
      }
    }
    if (ongId) loadInitialData();
  }, [ongId, isAuthenticated]);

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

  const handleGuestEmailSubmit = async (email: string, phone?: string) => {
    saveGuestEmail(email);
    setGuestEmail(email);
    if (phone) {
      saveGuestPhone(phone);
      setGuestPhone(phone);
    }
    setIsEmailModalOpen(false);
    if (listaEnvio.length > 0) {
      await handleConfirmarDoacao(email, phone);
    }
  };

  const handleConfirmarDoacao = async (emailOverride?: string, phoneOverride?: string) => {
    if (isOngUser) {
      setErrorMessage("Você está conectado como uma ONG. Contas de instituições não podem realizar doações. Para doar, desconecte-se ou use uma conta de doador.");
      return;
    }

    if (!listaEnvio.length) {
      setErrorMessage("Por favor, inclua pelo menos um item na lista de doação antes de confirmar.");
      return;
    }

    const effectiveGuestEmail = emailOverride || guestEmail;
    const effectiveGuestPhone = phoneOverride || guestPhone;

    if (!isAuthenticated) {
      if (!effectiveGuestEmail || !effectiveGuestPhone) {
        setIsEmailModalOpen(true);
        return;
      }
    } else {
      if (!hasPhone) {
        return;
      }
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const payload: DonationData = {
        tipoItem: "material",
        quantidade: totalItens,
        descricao: resumoItens,
        isAnonymous: isAuthenticated ? isAnonymous : true,
        ...(!isAuthenticated
          ? {
              guestEmail: effectiveGuestEmail,
              guestPhone: effectiveGuestPhone.replace(/\D/g, ""),
              acceptedTerms: true,
            }
          : {}),
      };

      if (onSubmit) await onSubmit(payload);
      if (!isAuthenticated) {
        setLastGuestEmail(effectiveGuestEmail);
        clearGuestEmail();
        setGuestEmail("");
        setGuestPhone("");
      }
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Erro ao doar materiais:", err);
      setErrorMessage(err?.message || "Não foi possível confirmar a doação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const hasPhone = !!userProfile?.phone;
  const isFormBlocked = !fetchingData && isAuthenticated && !hasPhone;
  const totalItens = listaEnvio.reduce((acc, item) => acc + item.quantidade, 0);
  const resumoItens = listaEnvio
    .map((i) => `${i.quantidade}x ${i.itemName}`)
    .join(", ");

  const effectiveOngName = ongData?.name || ongName;

  // Calcula o impacto social tangível em tempo real baseado nos itens materiais e na Causa Principal da ONG
  const materialImpact = useMemo(() => {
    const firstItem = listaEnvio[0];
    return calculateImpact({
      donationType: "material",
      materialQuantity: totalItens,
      materialDescription: firstItem?.itemName || "",
      primaryCategoryName: ongData?.primaryCategory?.name || ongData?.categories?.[0]?.name || null,
    });
  }, [listaEnvio, totalItens, ongData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans overflow-x-hidden">
      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-10">
        
        {/* CABEÇALHO COM IDENTIDADE DOECERTO */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            aria-label="Voltar"
            className="flex-shrink-0 bg-white p-2.5 rounded-xl shadow-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Doação de Materiais</h1>
            <p className="text-slate-600 text-sm sm:text-base font-medium mt-0.5">
              Agende a entrega de mantimentos ou materiais diretamente com a instituição.
            </p>
          </div>
        </div>

        {/* ALERTA DE CONTA DE ONG (NÃO PERMITIDA PARA DOAR) */}
        {isOngUser && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-amber-900">Você está conectado com uma conta de ONG</h4>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                Instituições cadastradas no DoeCerto não podem realizar doações no sistema. Para doar materiais a esta ONG, conecte-se com uma conta pessoal de doador ou saia da sua conta institucional.
              </p>
            </div>
          </div>
        )}

        {/* HERO CARD: A INSTITUIÇÃO BENEFICIÁRIA (Padrão Fintech Oficial) */}
        <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            {/* Avatar Institucional com logo real ou monograma */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              {ongData?.logo ? (
                <img src={ongData.logo} alt={effectiveOngName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg sm:text-2xl font-mono">
                  {effectiveOngName ? effectiveOngName.charAt(0).toUpperCase() : <Building2 size={22} />}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={14} className="text-emerald-600" /> Instituição Verificada
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-md">
                  Ponto de Coleta Oficial
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight truncate tracking-tight">
                {effectiveOngName}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-base font-medium mt-1">
                <IdCard size={16} className="flex-shrink-0 text-slate-400" />
                <span className="truncate">
                  CNPJ: <strong className="font-mono text-slate-800 font-semibold">{ongData?.cnpj || "Auditado"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Dados de Coleta e Logística em grid fintech */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3.5 sm:pt-4">
            {[
              { label: "Destino", value: ongData?.address ? ongData.address.split(",")[0] : "Sede Oficial" },
              { label: "Modalidade", value: "Entrega / Coleta" },
              { label: "Contato", value: ongData?.phone || "WhatsApp" },
              { label: "Logística", value: "Combinada" }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/90 border border-slate-200/80 p-2.5 sm:p-3.5 rounded-xl">
                <p className="text-slate-500 uppercase text-xs sm:text-sm font-bold tracking-wider mb-0.5 sm:mb-1 truncate">
                  {item.label}
                </p>
                <p className="font-bold text-sm sm:text-lg truncate text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ALERTA DE TELEFONE OBRIGATÓRIO (para agendamento presencial) */}
        <MissingPhoneAlert
          visible={isFormBlocked}
          onGoToProfile={() => router.push("/profile/edit")}
        />

        {/* TRILHA DO IMPACTO: STEPPER VERTICAL FINTECH */}
        <div className={`relative pl-4 sm:pl-8 border-l-2 border-slate-200 ml-3 sm:ml-6 flex flex-col gap-6 sm:gap-8 pb-4 ${isFormBlocked ? "opacity-40 pointer-events-none select-none" : ""}`}>

          {/* ==========================================
              PASSO 1: ADICIONAR ITENS À DOAÇÃO
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 01 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              01
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">
                  Selecione ou descreva os itens
                </h3>
                <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                  Escolha um item da lista de necessidades da instituição ou especifique o material que deseja doar.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <CustomDropdown
                  items={itemsCadastrados}
                  selectedValue={selectedItemId}
                  onSelect={setSelectedItemId}
                  disabled={fetchingData || isFormBlocked}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
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
                      disabled={fetchingData || isFormBlocked}
                      placeholder="Ex: 5"
                      className="w-full p-3 sm:p-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-bold text-base sm:text-lg focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                      Descrição ou Detalhes
                    </label>
                    <textarea
                      rows={1}
                      value={descricaoAdicional}
                      onChange={(e) => setDescricaoAdicional(e.target.value)}
                      disabled={fetchingData || isFormBlocked}
                      placeholder="Ex: Alimentos não perecíveis, agasalhos tamanho G..."
                      className="w-full p-3 sm:p-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-medium text-base focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 outline-none transition-all resize-none overflow-hidden placeholder:font-normal placeholder:text-slate-400"
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
                  className="mt-1 w-full bg-purple-50/80 hover:bg-purple-100/90 border border-purple-200/80 text-purple-700 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-xs text-sm sm:text-base"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Incluir na Lista de Doação</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==========================================
              PASSO 2: LOTE DE DOAÇÃO AGENDADO
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 02 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              02
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">
                    Itens agendados para entrega
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                    Materiais acumulados para envio neste lote.
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md uppercase tracking-wider shrink-0 font-mono">
                  {listaEnvio.length} {listaEnvio.length === 1 ? "Item" : "Itens"}
                </span>
              </div>

              {listaEnvio.length === 0 ? (
                <div className="py-8 sm:py-10 text-center border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 px-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-2 shadow-xs">
                    <PackageOpen size={22} />
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-800">
                    Nenhum item na lista ainda
                  </p>
                  <p className="text-xs sm:text-base text-slate-500 mt-1 max-w-[340px] font-medium leading-relaxed">
                    Preencha os campos no Passo 01 acima e clique em "Incluir na Lista".
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {listaEnvio.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-200 gap-2.5"
                    >
                      <div className="flex gap-2.5 sm:gap-3 items-center min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-slate-200 text-purple-700 font-bold font-mono text-xs sm:text-base flex items-center justify-center shrink-0 shadow-xs">
                          {item.quantidade}x
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg font-bold text-slate-900 truncate">
                            {item.itemName}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mt-0.5 flex items-center gap-1.5">
                            <FileText size={14} className="inline shrink-0 text-slate-400" />
                            {item.detalhes}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setListaEnvio(listaEnvio.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-red-600 p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remover item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ==========================================
              PASSO 3: IDENTIFICAÇÃO E CONFIRMAÇÃO
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 03 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              03
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">
                  Confirmação e Logística
                </h3>
                <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                  A instituição entrará em contato para alinhar os detalhes e o ponto de entrega.
                </p>
              </div>

              {/* Doador visitante: chip de anonimato responsivo */}
              {!isAuthenticated && (
                <div className="w-full mb-5 sm:mb-6 flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Lock size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                          Identificação Protegida
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                          Anônima
                        </span>
                      </div>
                      <span className="block text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5 font-mono">
                        {guestEmail ? `${guestEmail}${guestPhone ? ` • ${guestPhone}` : ""}` : "Sem e-mail cadastrado"}
                      </span>
                    </div>
                  </div>
                  <button
                    id="donation-change-guest-contact"
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 min-[440px]:py-1.5 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer text-center w-full min-[440px]:w-auto ml-0 min-[440px]:ml-2"
                  >
                    {guestEmail ? "Alterar" : "Adicionar"}
                  </button>
                </div>
              )}

              {/* Usuário autenticado: checkbox anonimato */}
              {isAuthenticated && (
                <label className="flex items-center gap-2.5 cursor-pointer pb-4 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#6B39A7] accent-[#6B39A7] cursor-pointer shrink-0"
                  />
                  <span className="text-sm sm:text-base font-bold text-slate-800">
                    Ocultar meu nome (Doar anonimamente)
                  </span>
                </label>
              )}

              {/* Resumo da Transparência DoeCerto */}
              <div className="bg-slate-50/90 rounded-xl p-3.5 sm:p-5 my-5 border border-slate-200">
                <div className="flex flex-col min-[440px]:flex-row min-[440px]:justify-between min-[440px]:items-center text-sm sm:text-base font-medium text-slate-600 mb-2.5 gap-1">
                  <span>Destino dos materiais</span>
                  <span className="font-bold text-slate-900 truncate max-w-full min-[440px]:max-w-[240px]">
                    {effectiveOngName}
                  </span>
                </div>
                <div className="flex flex-col min-[440px]:flex-row min-[440px]:justify-between min-[440px]:items-center text-sm sm:text-base font-medium text-slate-600 mb-3 gap-1">
                  <span>Taxa de intermediação</span>
                  <span className="font-bold text-emerald-600 break-words">R$ 0,00 · 100% gratuito e direto</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-slate-900">Total de itens</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#6B39A7] font-mono">
                    {totalItens} {totalItens === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>

              {/* Mensagem de Erro Amigável */}
              {errorMessage && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-left">
                  <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-red-900">Atenção</p>
                    <p className="text-xs sm:text-sm text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-red-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                    title="Fechar"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Botão de Finalização Direta (Sem modais intermediários) */}
              <button
                type="button"
                onClick={() => handleConfirmarDoacao()}
                disabled={isFormBlocked || loading || listaEnvio.length === 0 || isOngUser}
                className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all cursor-pointer shadow-sm ${
                  isFormBlocked || loading || listaEnvio.length === 0 || isOngUser
                    ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#6B39A7] hover:bg-[#582d8c] text-white shadow-purple-500/25 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Processando agendamento...
                  </span>
                ) : (
                  `Confirmar e Agendar Doação (${totalItens} ${totalItens === 1 ? "item" : "itens"})`
                )}
              </button>

              {listaEnvio.length === 0 && (
                <p className="text-sm sm:text-base text-center text-slate-500 font-medium mt-3">
                  Por favor, inclua pelo menos um item no Passo 01 para liberar o agendamento.
                </p>
              )}

              {/* Aviso de Logística Oficial */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex items-start gap-3 text-left">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[15px] sm:text-base text-slate-700 font-medium leading-relaxed">
                  <strong className="text-slate-900 font-bold">Logística Oficial DoeCerto:</strong> Sua intenção de doação é repassada diretamente à instituição. A equipe da ONG entrará em contato via WhatsApp ou e-mail para combinar data, horário e orientações para entrega na sede oficial auditada.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE IDENTIFICAÇÃO DO VISITANTE (Se clicar em 'Alterar' ou se faltar dados) */}
      <GuestEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleGuestEmailSubmit}
        initialEmail={guestEmail}
        initialPhone={guestPhone}
        ongName={effectiveOngName}
        type="material"
        isLoading={loading}
        submitLabel={listaEnvio.length > 0 ? "Continuar e agendar doação" : "Continuar"}
      />

      {/* MODAL DE SUCESSO (Idêntico ao Pix) */}
      {isSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">Doação Registrada!</h2>
            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Sua intenção de doação para <strong className="text-slate-800 font-bold">{effectiveOngName}</strong> foi enviada para agendamento. Muito obrigado pelo seu apoio!
            </p>

            {/* Destaque do Impacto Gerado em Materiais */}
            {materialImpact && materialImpact.units > 0 && (
              <div className="bg-purple-50 border border-purple-200/90 rounded-2xl p-4 text-left mb-6 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 shadow-xs mt-0.5">
                  <CategoryImpactIcon category={ongData?.primaryCategory?.name || listaEnvio[0]?.itemName} size={20} className="text-[#6B39A7]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Impacto Estimado da sua Doação</p>
                  <p className="text-sm sm:text-base font-bold text-purple-950 mt-0.5 leading-snug">
                    {materialImpact.impactText}
                  </p>
                </div>
              </div>
            )}

            {!isAuthenticated && lastGuestEmail && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left mb-6 flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#6B39A7] shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  Registramos sua doação no e-mail <strong className="break-all text-slate-900 font-bold">{lastGuestEmail}</strong>. Se você criar uma conta com esse mesmo e-mail, seu histórico será vinculado automaticamente.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              {!isAuthenticated && (
                <button
                  onClick={() => router.push("/register")}
                  className="w-full bg-[#6B39A7] hover:bg-[#5b2f8e] text-white py-3.5 rounded-xl font-bold text-base shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  Criar conta para acompanhar
                </button>
              )}
              <button
                onClick={() => router.push("/home")}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                  !isAuthenticated
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "bg-[#6B39A7] hover:bg-[#5b2f8e] text-white shadow-sm active:scale-[0.98]"
                }`}
              >
                Voltar ao Início
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setListaEnvio([]);
                    setIsSuccess(false);
                  }}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors cursor-pointer mt-1"
                >
                  Fazer outra Doação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}