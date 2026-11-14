"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Heart, Award, X, Phone, Home, Star, Pencil,
  History, Package, CheckCircle2, Clock, FileText, ArrowRight,
  Camera, AlertCircle, Tag, MessageSquare, AlertTriangle, ExternalLink,
  LogOut, Download, Trash2, ShieldAlert, Globe, Loader2
} from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  OngAsaasKycSummary,
  OngMyProfile,
  OngsProfileService,
} from "@/services/ongs-profile.service";
import { BankAccountData, BankAccountService } from "@/services/bank-account.service";
import { DonationService, type DonationService as DonationRecord } from "@/services/donations.service";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { LgpdDeleteAccountModal } from "@/components/specific/Lgpd/LgpdDeleteAccountModal";
import { OngDocumentsModal } from "./OngDocumentsModal";
import { OngAsaasKycCard } from "./OngAsaasKycCard";
import { OngBankAccountCard } from "./OngBankAccountCard";
import {
  buildWebsiteHref,
  formatWebsiteLabel,
  buildInstagramHref,
  formatInstagramLabel,
  buildFacebookHref,
  formatFacebookLabel,
  buildWhatsappHref,
  formatWhatsappLabel,
} from "@/utils/socialChannels";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface OngReviewRecord {
  id?: number | string;
  score?: number;
  stars?: number;
  comment?: string | null;
  donor?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
}

interface OngDashboardProps {
  ong?: OngMyProfile | null;
  initialReviews?: OngReviewRecord[];
  initialDonations?: DonationRecord[];
  initialBankAccount?: BankAccountData | null;
  initialKycSummary?: OngAsaasKycSummary | null;
  hasServerData?: boolean;
}

export default function OngDashboard({
  ong: initialOng,
  initialReviews = [],
  initialDonations = [],
  initialBankAccount = null,
  initialKycSummary = null,
  hasServerData = false,
}: OngDashboardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userRole, refreshSession, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [loading, setLoading] = useState(!hasServerData && !initialOng);
  const [ong, setOng] = useState<OngMyProfile | undefined>(() => {
    if (!initialOng) return undefined;
    if (!initialKycSummary) return initialOng;
    return {
      ...initialOng,
      asaasAccountStatus: initialKycSummary.asaasAccountStatus,
      hasAsaasSubaccount: initialKycSummary.hasSubaccount,
      verificationStatus: initialKycSummary.verificationStatus || initialOng.verificationStatus,
    };
  });
  const [reviews, setReviews] = useState<OngReviewRecord[]>(initialReviews);
  const [donations, setDonations] = useState<DonationRecord[]>(initialDonations);
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(initialBankAccount);
  const [kycSummary, setKycSummary] = useState<OngAsaasKycSummary | null>(initialKycSummary);
  const [loadingKycSummary, setLoadingKycSummary] = useState(false);

  // Guard de autenticação e proteção contra restauração via BFCache no navegador
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (userRole !== "ong" && userRole !== "admin"))) {
      window.location.replace("/login");
    }
  }, [authLoading, isAuthenticated, userRole]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        refreshSession();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [refreshSession]);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [confirmModal, setConfirmModal] = useState<{ id: number; type: 'accept' | 'reject' } | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [dismissSetupPrompt, setDismissSetupPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dismiss_ong_setup_prompt") === "true";
    }
    return false;
  });

  const handleDismissSetup = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismiss_ong_setup_prompt", "true");
    }
    setDismissSetupPrompt(true);
  };

  const hasAsaasSubaccount = kycSummary?.hasSubaccount ?? Boolean(ong?.hasAsaasSubaccount);
  const effectiveAsaasStatus = (
    kycSummary?.asaasAccountStatus ||
    ong?.asaasAccountStatus ||
    "pending"
  ).toLowerCase();
  const isAsaasMissingProfile =
    ong?.verificationStatus === "verified" && !hasAsaasSubaccount;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMenuOpen(false);
    await logout("/login");
  };

  const donorPhone = selectedDonation?.donor?.profile?.contactNumber ?? "";
  const cleanPhone = donorPhone.replace(/\D/g, "");

  const generateDynamicMessage = () => {
    if (!selectedDonation) return "";

    const ongName = ong?.name || "Nossa ONG";
    const donorName = selectedDonation.donor?.user?.name || "Doador";
    const donationId = selectedDonation.id;

    if (selectedDonation.type === "monetary") {
      return `Olá, ${donorName}! Sou da ONG ${ongName}. Confirmamos o recebimento do comprovante da sua doação financeira (Protocolo #${donationId}) no valor de R$ ${selectedDonation.amount}. Muito obrigado pelo apoio!`;
    } else {
      const description = selectedDonation.materialDescription || "itens";
      const quantity = selectedDonation.materialQuantity ? ` (Quantidade: ${selectedDonation.materialQuantity})` : "";
      return `Olá, ${donorName}! Sou da ONG ${ongName}. Gostaria de alinhar a entrega da sua doação de material (Protocolo #${donationId}): ${description}${quantity}.`;
    }
  };

  const whatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}?text=${encodeURIComponent(generateDynamicMessage())}`
    : null;

  const getFileExtension = (url: string) => {
    if (!url) return "";
    return url.split(/[#?]/)[0].split('.').pop()?.toLowerCase() || "";
  };

  // --- GERADOR DE PDF DA DOAÇÃO ÚNICA ---
  const exportSingleDonationPDF = (donation: any) => {
    const doc = new jsPDF();
    const primaryColor = "#6B39A7";

    doc.setFillColor(74, 29, 122);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(ong?.name || "Comprovante de Doação", 15, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 155, 25);

    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Recibo de Doação - Protocolo #${donation.id}`, 15, 55);

    const tableRows = [
      ["Doador", donation.donor?.user?.name || "Não identificado"],
      ["Contato do Doador", donation.donor?.profile?.contactNumber || "Não informado"],
      ["Tipo de Doação", donation.type === "monetary" ? "Financeira (Dinheiro)" : "Material / Insumos"],
      ["Status", donation.status === "COMPLETED" ? "Recebido" : donation.status === "CANCELED" ? "Rejeitado" : "Pendente"],
      ["Data de Cadastro", new Date(donation.createdAt).toLocaleDateString('pt-BR')],
      [
        donation.type === "monetary" ? "Valor Destinado" : "Descrição dos Itens",
        donation.type === "monetary" ? `R$ ${donation.amount}` : `${donation.materialDescription} ${donation.materialQuantity ? `(Qtd: ${donation.materialQuantity})` : ''}`
      ]
    ];

    autoTable(doc, {
      startY: 65,
      head: [["Campo", "Detalhes"]],
      body: tableRows,
      headStyles: { fillColor: [74, 29, 122], fontStyle: "bold" },
      styles: { fontSize: 11, cellPadding: 5 },
      theme: "striped"
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setTextColor("#555555");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.text("Este documento confirma o registro de intenção ou recebimento da doação através da plataforma DoeCerto.", 15, finalY);
    doc.text("Agradecemos imensamente o apoio e a solidariedade de todos os envolvidos.", 15, finalY + 7);

    doc.save(`doacao_protocolo_${donation.id}.pdf`);
  };

  const applyKycSummary = useCallback((summary: OngAsaasKycSummary) => {
    setKycSummary(summary);
    setOng((prev) =>
      prev
        ? {
            ...prev,
            asaasAccountStatus: summary.asaasAccountStatus,
            hasAsaasSubaccount: summary.hasSubaccount,
            verificationStatus: summary.verificationStatus || prev.verificationStatus,
          }
        : prev,
    );
  }, []);

  async function loadKycSummary() {
    try {
      setLoadingKycSummary(true);
      const summary = await OngsProfileService.getMyAsaasKycStatus();
      applyKycSummary(summary);
    } catch (error) {
      console.error("Erro ao consultar status KYC no Asaas:", error);
    } finally {
      setLoadingKycSummary(false);
    }
  }

  async function activateSubaccount() {
    try {
      setLoadingKycSummary(true);
      const summary = await OngsProfileService.syncMyAsaasSubaccount();
      applyKycSummary(summary);
      if (summary.hasSubaccount) {
        toast.success("Subconta financeira ativada com sucesso!");
      } else if (summary.provisionError) {
        toast.error(summary.provisionError);
      } else {
        toast("Subconta ainda pendente. Verifique os requisitos indicados.");
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível ativar a subconta financeira no momento.";
      toast.error(msg);
      throw error;
    } finally {
      setLoadingKycSummary(false);
    }
  }

  const loadData = useCallback(async () => {
    try {
      const profileData = await OngsProfileService.getMyProfile();
      setOng(profileData);

      if (profileData.id) {
        const [reviewsRes, donationsData, kycRes, bankRes] = await Promise.all([
          api(`/ongs/${profileData.id}/ratings`),
          DonationService.getReceivedDonations(),
          OngsProfileService.getMyAsaasKycStatus().catch((error) => {
            console.error("Erro ao consultar status KYC no Asaas:", error);
            return null;
          }),
          BankAccountService.getMyAccount().catch(() => null),
        ]);

        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        setDonations(donationsData);
        setBankAccount(bankRes);
        if (kycRes) {
          applyKycSummary(kycRes);
        }
      } else {
        const [kycRes, bankRes] = await Promise.all([
          OngsProfileService.getMyAsaasKycStatus().catch((error) => {
            console.error("Erro ao consultar status KYC no Asaas:", error);
            return null;
          }),
          BankAccountService.getMyAccount().catch(() => null),
        ]);
        setBankAccount(bankRes);
        if (kycRes) {
          applyKycSummary(kycRes);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [applyKycSummary]);

  useEffect(() => {
    if (!hasServerData) {
      void Promise.resolve().then(() => loadData());
    }
  }, [hasServerData, loadData]);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { id, type } = confirmModal;

    try {
      setLoading(true);
      if (type === 'accept') {
        await DonationService.acceptDonation(id);
      } else {
        await DonationService.rejectDonation(id);
      }

      setConfirmModal(null);
      setSelectedDonation(null);
      setIsHistoryOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao processar ação:", error);
      const errorMessage = error.response?.data?.message || "Não foi possível atualizar o status da doação.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ong) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <Loader2 className="animate-spin text-[#6B39A7]" size={40} />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Carregando painel...
        </span>
      </div>
    );
  }

  if ((!ong || !ong.description) && !dismissSetupPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-[#6B39A7]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Complete seu Perfil</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed font-medium">
            Sua ONG ainda não possui as informações configuradas. Complete seu perfil para começar a receber doações.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/ong-profilesetup')}
              className="w-full bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              Configurar agora <ArrowRight size={20} />
            </button>
            <button
              onClick={handleDismissSetup}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              Configurar mais tarde
            </button>
            <button
              onClick={handleLogout}
              className="w-full pt-2 flex items-center justify-center gap-2 text-slate-400 hover:text-red-600 text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!ong) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32">
      <Toaster position="top-center" />
      {(!ong?.hasEstatuto || !ong?.hasAta) && (
        <button
          onClick={() => setIsDocsModalOpen(true)}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 sm:gap-3 z-50 text-xs sm:text-sm shadow-md relative transition-colors cursor-pointer group"
        >
          <FileText size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-center leading-tight">
            Documentação Pendente para Receber Doações Pix: <span className="underline">Envie o Estatuto e a Ata da sua ONG para homologação bancária</span>.
          </span>
        </button>
      )}
      {ong.verificationStatus === 'verified' && ong.isRestricted && (
        <button
          onClick={() => setShowRestrictedModal(true)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-800 border-b border-red-200 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 sm:gap-3 z-50 text-xs sm:text-sm shadow-sm relative transition-colors cursor-pointer group"
        >
          <AlertCircle size={18} className="shrink-0 text-red-600 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-center leading-tight">
            Sua conta foi restringida por medidas de segurança. <span className="underline font-bold text-red-700">Clique para ver detalhes</span>.
          </span>
        </button>
      )}

      {/* Header / Banner */}
      <div className="relative w-full h-[220px] sm:h-[360px] bg-gray-100 border-b border-purple-100 flex items-center justify-center">
        {ong.bannerUrl ? (
          <motion.img
            src={ong.bannerUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: ong.bannerPosition || "50% 50%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            alt="Banner da ONG"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-violet-50 to-pink-100" />
        )}

        <div className="absolute top-4 right-4 sm:right-10 z-50">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-slate-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-100 shadow-inner">
                {ong.avatarUrl ? (
                  <img src={ong.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-[#6B39A7] flex items-center justify-center text-white font-bold">
                    {ong.name?.charAt(0) || 'O'}
                  </div>
                )}
              </div>
              <span className="hidden sm:block min-w-0 truncate text-slate-800 font-extrabold text-sm px-1">
                {ong.name || "ONG"}
              </span>
              <motion.div className="shrink-0 text-[#6B39A7] mr-1" animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] origin-top-right"
                >
                  <button onClick={() => { setIsMenuOpen(false); setIsDocsModalOpen(true); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                    <FileText size={18} className="text-[#6B39A7]" />
                    <span className="font-bold text-slate-700">Documentos Societários</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={() => { setIsMenuOpen(false); router.push("/ong-profilesetup"); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                    <Pencil size={18} className="text-[#6B39A7]" />
                    <span className="font-bold text-slate-700">Editar Perfil</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={() => { setIsMenuOpen(false); setIsLgpdModalOpen(true); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-left transition cursor-pointer group">
                    <Trash2 size={18} className="text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="font-bold text-red-600">Excluir Conta</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                    <LogOut size={18} className="text-slate-500" />
                    <span className="font-bold text-slate-600">Sair</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div className="absolute -bottom-14 left-6 sm:left-10 z-50 w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
          {ong.avatarUrl ? (
            <img src={ong.avatarUrl} className="w-full h-full object-cover" alt={ong.name} />
          ) : (
            <div className="w-full h-full bg-[#6B39A7] flex items-center justify-center">
              <span className="text-white text-4xl sm:text-5xl font-black">{ong.name?.charAt(0) || 'O'}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Conteúdo Abaixo do Header */}
      <div className="px-4 sm:px-10 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 flex items-center flex-wrap gap-2 sm:gap-3">
          <span>{ong.name || "Minha ONG"}</span>
          {ong.isRestricted ? (
            <button
              onClick={() => setShowRestrictedModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-bold shadow-sm hover:bg-red-200 hover:scale-[1.02] transition-all active:scale-95 shrink-0 cursor-pointer translate-y-0.5 sm:translate-y-1"
              title="Sua conta foi restringida por medidas de segurança"
            >
              <AlertTriangle size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4 text-red-600" />
              Restringida
            </button>
          ) : (ong.verificationStatus !== 'verified' || effectiveAsaasStatus !== 'approved') ? (
            <button
              onClick={() => setShowPendingModal(true)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:scale-[1.02] transition-all active:scale-95 shrink-0 cursor-pointer translate-y-0.5 sm:translate-y-1 ${
                effectiveAsaasStatus === 'rejected'
                  ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : isAsaasMissingProfile
                    ? "bg-purple-100 text-[#6B39A7] hover:bg-purple-200"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
              title={
                isAsaasMissingProfile
                  ? "Complete endereço e telefone no perfil para abrir a subconta no Asaas"
                  : effectiveAsaasStatus === 'rejected'
                    ? "Há pendências documentais recusadas no Asaas"
                    : ong.verificationStatus === 'verified'
                      ? "Aguardando aprovação do serviço de pagamentos (Asaas)"
                      : "Sua conta está em análise de auditoria e conformidade"
              }
            >
              {effectiveAsaasStatus === 'rejected' ? (
                <ShieldAlert size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
              ) : (
                <Clock size={14} strokeWidth={3} className="sm:w-4 sm:h-4" />
              )}
              {isAsaasMissingProfile
                ? "Completar Cadastro"
                : effectiveAsaasStatus === 'rejected'
                  ? "Ajuste Bancário (KYC)"
                  : ong.verificationStatus === 'verified'
                    ? "Aprovação Bancária"
                    : "Em Análise"}
            </button>
          ) : (ong.verificationStatus === 'verified' && effectiveAsaasStatus === 'approved') ? (
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              src="/iconeselo.svg"
              alt="Selo DoeCerto"
              title="ONG Verificada Oficialmente"
              className="w-6 h-6 sm:w-[32px] sm:h-[32px] lg:w-[35px] lg:h-[35px] shrink-0 drop-shadow-sm cursor-help translate-y-[3.5px] sm:translate-y-[5px] lg:translate-y-[5.5px] -ml-2 sm:-ml-2.5 lg:-ml-3"
            />
          ) : null}
        </h1>

        <div className="text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm sm:text-lg font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin size={18} className="text-red-400" /> {ong.address?.city || "Localização não definida"}
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={18} className="text-blue-400" />
            {typeof ong.yearsOfOperation === "number"
              ? `${ong.yearsOfOperation} ${ong.yearsOfOperation === 1 ? "ano" : "anos"} de atuação`
              : (ong.displayYears || "Tempo não informado")}
          </span>
        </div>

        {ong.categories && ong.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ong.categories.map((cat: any, idx: number) => (
              <span key={cat.id || idx} className="px-3 py-1 bg-purple-50 text-[#6B39A7] border border-purple-100 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                <Tag size={12} className="text-purple-400" /> {cat.name || cat}
              </span>
            ))}
          </div>
        )}

        {!ong?.description && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 text-purple-900">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="font-black text-base sm:text-lg text-purple-950 tracking-tight">Seu perfil ainda não está completo</p>
                <p className="text-sm sm:text-base text-purple-800 font-medium mt-0.5 leading-relaxed">
                  Complete as informações e documentos para poder receber doações na plataforma.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/ong-profilesetup')}
              className="w-full sm:w-auto px-6 py-3 bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold rounded-2xl text-sm sm:text-base shrink-0 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Completar Perfil <ArrowRight size={18} />
            </button>
          </div>
        )}

        <div className="mt-6">
          <OngAsaasKycCard
            ong={ong}
            summary={kycSummary}
            loadingSummary={loadingKycSummary}
            onRefreshSummary={loadKycSummary}
            onActivateSubaccount={activateSubaccount}
            onSummaryUpdated={applyKycSummary}
            onCompleteProfile={() => router.push('/ong-profilesetup')}
            onOpenLegacyDocsModal={() => setIsDocsModalOpen(true)}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-[#6B39A7]">Sobre</h2>
            <p className="mt-3 text-gray-700 text-sm sm:text-lg leading-relaxed">{ong.description || "Nenhuma descrição informada ainda."}</p>
            <div className="mt-5 pt-5 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-[#6B39A7] shrink-0" />
                <span className="text-sm sm:text-base font-bold">
                  {ong.contactNumber ? formatWhatsappLabel(ong.contactNumber) : "Não informado"}
                </span>
              </div>

              {ong.whatsappNumber && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaWhatsapp size={19} className="text-emerald-600 shrink-0" />
                  <a
                    href={buildWhatsappHref(ong.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-emerald-700 hover:underline inline-flex items-center gap-1.5 break-all"
                  >
                    <span>{formatWhatsappLabel(ong.whatsappNumber)}</span>
                    <ExternalLink size={13} className="shrink-0 opacity-75" />
                  </a>
                </div>
              )}

              {(ong.websiteUrl || ong.website) && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe size={18} className="text-[#6B39A7] shrink-0" />
                  <a
                    href={buildWebsiteHref(ong.websiteUrl || ong.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-[#6B39A7] underline inline-flex items-center gap-1.5 break-all"
                  >
                    <span>{formatWebsiteLabel(ong.websiteUrl || ong.website)}</span>
                    <ExternalLink size={13} className="shrink-0 opacity-75" />
                  </a>
                </div>
              )}

              {ong.instagramUrl && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaInstagram size={18} className="text-pink-600 shrink-0" />
                  <a
                    href={buildInstagramHref(ong.instagramUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-pink-700 hover:underline inline-flex items-center gap-1.5 break-all"
                  >
                    <span>{formatInstagramLabel(ong.instagramUrl)}</span>
                    <ExternalLink size={13} className="shrink-0 opacity-75" />
                  </a>
                </div>
              )}

              {ong.facebookUrl && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaFacebook size={18} className="text-blue-600 shrink-0" />
                  <a
                    href={buildFacebookHref(ong.facebookUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-blue-700 hover:underline inline-flex items-center gap-1.5 break-all"
                  >
                    <span>{formatFacebookLabel(ong.facebookUrl)}</span>
                    <ExternalLink size={13} className="shrink-0 opacity-75" />
                  </a>
                </div>
              )}

              <div className="flex items-start gap-3 text-gray-700">
                <Home size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm sm:text-base font-bold">
                  {ong.address ? `${ong.address.city} - ${ong.address.state}` : "Endereço não informado"}
                </span>
              </div>
            </div>
          </div>

          <OngBankAccountCard
            bankAccount={bankAccount}
            ongCnpj={ong.cnpj}
            ongName={ong.name}
            loading={loading}
            onAccountUpdated={(updated) => setBankAccount(updated)}
          />

          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-[#6B39A7] mb-4">Gestão e Estatísticas</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-gray-50 text-center border border-gray-200">
                <Heart size={20} className="mx-auto text-pink-500" fill="currentColor" />
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">{donations.length || 0}</p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-tight">Doações</p>
              </div>

              <button onClick={() => setIsReviewsOpen(true)} className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-yellow-50 text-center border border-yellow-100 hover:bg-yellow-100 transition-all cursor-pointer">
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= Math.floor(ong.stats?.ratingAverage || 0) ? "#facc15" : "transparent"} className={s <= Math.floor(ong.stats?.ratingAverage || 0) ? "text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">{(ong.stats?.ratingAverage || 0).toFixed(1)}</p>
                <p className="text-[10px] sm:text-sm text-yellow-700 font-bold uppercase tracking-tight underline">Avaliações</p>
              </button>

              <button onClick={() => setIsHistoryOpen(true)} className="w-full md:w-auto md:flex-1 p-3 sm:p-4 rounded-lg bg-purple-50 text-center border border-purple-100 hover:bg-purple-100 transition-all">
                <History size={20} className="mx-auto text-[#6B39A7]" />
                <p className="mt-1 text-base sm:text-xl font-bold text-[#6B39A7]">Histórico</p>
                <p className="text-[10px] sm:text-sm text-purple-600 font-bold uppercase tracking-tight">Ver Doações</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE HISTÓRICO --- */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-t-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Doações Recebidas</h3>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2.5 bg-white hover:bg-gray-100 rounded-full shadow-sm text-gray-700 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                {donations.length > 0 ? donations.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3.5">
                        {item.type === "monetary" ? <Heart size={22} className="text-green-500 mt-0.5" fill="currentColor" /> : <Package size={22} className="text-blue-500 mt-0.5" />}
                        <div>
                          <p className="font-black text-slate-900 text-base sm:text-lg">{item.type === "monetary" ? "Doação em Dinheiro" : "Doação de Material"}</p>
                          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 line-clamp-1">{item.type === "monetary" ? `Valor: R$ ${item.amount}` : item.materialDescription}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1.5">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase shrink-0 ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : item.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status === 'COMPLETED' ? 'Recebido' : item.status === 'CANCELED' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                      <button onClick={() => setSelectedDonation(item)} className="flex-1 py-2.5 bg-purple-50 text-[#6B39A7] hover:bg-purple-100 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                        <FileText size={16} /> Ver Detalhes
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-gray-500">
                    <History size={40} className="mx-auto mb-2 opacity-20" />
                    <p>Nenhuma doação registrada.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE DETALHES DA DOAÇÃO --- */}
      <AnimatePresence>
        {selectedDonation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 text-gray-900">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedDonation(null)} className="absolute top-4 right-4 z-10 p-2.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
                <X size={20} className="text-gray-700" />
              </button>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className={`p-3.5 rounded-2xl ${selectedDonation.type === 'monetary' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {selectedDonation.type === 'monetary' ? <Heart size={26} fill="currentColor" /> : <Package size={26} />}
                  </div>
                  <div>
                    <h4 className="font-black text-2xl sm:text-3xl text-slate-900 leading-tight">Detalhes da Doação</h4>
                    <p className="text-base text-slate-500 font-medium mt-0.5">Protocolo #{selectedDonation.id}</p>
                  </div>
                </div>

                {/* Bloco Refatorado e Simplificado de Visualização / Ação do Comprovante */}
                {selectedDonation.type === 'monetary' && (
                  <div className="bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 p-2 mb-6">
                    {selectedDonation.proofUrl ? (() => {
                      const sanitizedPath = selectedDonation.proofUrl
                        .replace(/\\/g, '/')
                        .replace(/^\/+/, '');

                      const fullUrl = selectedDonation.proofUrl.startsWith('http')
                        ? selectedDonation.proofUrl
                        : `${API_URL?.replace(/\/+$/, '')}/${sanitizedPath}`;

                      const ext = getFileExtension(fullUrl);

                      if (ext === "pdf") {
                        return (
                          <div className="h-48 flex flex-col items-center justify-center bg-purple-50/50 rounded-[18px] border border-purple-100 p-4 text-center">
                            <FileText size={48} className="text-[#6B39A7] mb-2" />
                            <p className="text-sm font-bold text-gray-800 break-all line-clamp-1">
                              Comprovante_#{selectedDonation.id}.pdf
                            </p>
                            <p className="text-xs text-gray-500">Documento Digital PDF</p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="relative group">
                            <img
                              src={fullUrl}
                              alt="Comprovante de Doação"
                              crossOrigin="use-credentials" className="w-full h-48 object-cover rounded-[18px] shadow-sm cursor-zoom-in"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src !== fullUrl) return;
                                target.src = "https://placehold.co/400x200?text=Erro+ao+carregar+imagem";
                              }}
                              onClick={() => setZoomImage(fullUrl)}
                            />
                            <button
                              onClick={() => setZoomImage(fullUrl)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold rounded-[18px] backdrop-blur-[2px]"
                            >
                              <ExternalLink size={20} /> Ver em tela cheia
                            </button>
                          </div>
                        );
                      }
                    })() : (
                      <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Camera size={40} strokeWidth={1} />
                        <p className="text-xs font-medium">Comprovante não enviado</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition text-sm">
                      <MessageSquare size={18} /> Falar com o doador no WhatsApp
                    </a>
                  )}

                  {/* Condicional Refatorada: Oculta o botão de PDF se o comprovante for imagem */}
                  {selectedDonation.type === 'monetary' && selectedDonation.proofUrl ? (
                    (() => {
                      const ext = getFileExtension(selectedDonation.proofUrl);
                      const fullUrl = selectedDonation.proofUrl.startsWith('http')
                        ? selectedDonation.proofUrl
                        : `${API_URL?.replace(/\/+$/, '')}/${selectedDonation.proofUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`;

                      if (ext === 'pdf') {
                        return (
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 text-[#6B39A7] border border-purple-200 font-bold rounded-xl hover:bg-purple-100 transition text-sm"
                          >
                            <ExternalLink size={18} /> Visualizar / Baixar Comprovante PDF
                          </a>
                        );
                      }
                      return null; // Some com o botão se for imagem png/jpg
                    })()
                  ) : (
                    <button
                      onClick={() => exportSingleDonationPDF(selectedDonation)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 text-[#6B39A7] border border-purple-200 font-bold rounded-xl hover:bg-purple-100 transition text-sm"
                    >
                      <Download size={18} /> Baixar Relatório PDF
                    </button>
                  )}

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500 font-bold">Doador</span>
                    <span className="text-sm text-gray-900 font-black">{selectedDonation.donor?.user?.name || 'Não identificado'}</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500 font-bold block mb-1">
                      {selectedDonation.type === 'monetary' ? 'Descrição do Pagamento' : 'Itens Doados'}
                    </span>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      {selectedDonation.type === 'monetary' ? `Transferência de R$ ${selectedDonation.amount}` : selectedDonation.materialDescription}
                    </p>
                  </div>

                  {selectedDonation.type !== 'monetary' && selectedDonation.materialQuantity && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-blue-50">
                      <span className="text-sm text-gray-500 font-bold">Quantidade de Itens</span>
                      <span className="text-sm text-blue-600 font-black">{selectedDonation.materialQuantity}</span>
                    </div>
                  )}
                </div>

                {selectedDonation.status === 'PENDING' ? (
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({ id: selectedDonation.id, type: 'reject' })} className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors">Recusar</button>
                    <button onClick={() => setConfirmModal({ id: selectedDonation.id, type: 'accept' })} className="flex-1 py-4 bg-[#6B39A7] text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#3a1661] transition-all">Aceitar Doação</button>
                  </div>
                ) : (
                  <button onClick={() => setSelectedDonation(null)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">Fechar</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6 text-gray-900">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center border border-gray-100">
              <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ring-4 ${confirmModal.type === 'accept' ? 'bg-green-100 text-green-600 ring-green-50' : 'bg-red-100 text-red-600 ring-red-50'}`}>
                {confirmModal.type === 'accept' ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <AlertTriangle size={40} strokeWidth={2.5} />}
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Confirmação</h4>
              <p className="text-base sm:text-lg text-slate-600 font-medium mt-3 leading-relaxed">
                Deseja {confirmModal.type === 'accept' ? 'aceitar' : 'rejeitar'} esta doação? Esta ação não pode ser desfeita.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button onClick={handleConfirmAction} className={`w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all active:scale-[0.98] ${confirmModal.type === 'accept' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}>
                  Sim, continuar
                </button>
                <button onClick={() => setConfirmModal(null)} className="w-full py-3.5 rounded-2xl font-bold text-base text-slate-500 hover:text-slate-800 transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- OVERLAY DE ZOOM --- */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomImage(null)} className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-2 backdrop-blur-sm">
            <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-50" onClick={(e) => { e.stopPropagation(); setZoomImage(null); }}><X size={32} /></button>
            <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} src={zoomImage} crossOrigin="use-credentials" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="Comprovante ampliado" onClick={(e) => e.stopPropagation()} />
            <p className="absolute bottom-10 text-white/60 font-medium text-sm">Toque fora para fechar</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE AVALIAÇÕES --- */}
      <AnimatePresence>
        {isReviewsOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm text-gray-900">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-t-[24px] md:rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-amber-50/70">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <Star className="text-amber-500" fill="currentColor" size={24} /> O que dizem sobre nós
                </h3>
                <button onClick={() => setIsReviewsOpen(false)} className="p-2.5 bg-white hover:bg-gray-100 rounded-full shadow-sm text-gray-700 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                {reviews.length > 0 ? reviews.map((r, index) => (
                  <div key={r.id || index} className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-gray-50/60 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-base text-slate-900">{r.donor?.user?.name || "Doador Anônimo"}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={15} fill={star <= Number(r.score ?? r.stars ?? 0) ? "#facc15" : "transparent"} className={star <= Number(r.score ?? r.stars ?? 0) ? "text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-base text-slate-700 leading-relaxed font-medium mt-1">{r.comment || "Sem comentário enviado."}</p>
                  </div>
                )) : (
                  <div className="text-center py-12 text-slate-500 font-medium text-base">
                    <p>Sua ONG ainda não recebeu avaliações.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Análise Pendente */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowPendingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <button
                onClick={() => setShowPendingModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 hover:text-gray-700 p-2.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6 shadow-inner ring-4 ring-amber-50">
                <Clock size={40} strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                {isAsaasMissingProfile
                  ? "Complete Seu Cadastro Bancário"
                  : effectiveAsaasStatus === 'rejected'
                    ? "Pendência na Homologação Bancária"
                    : ong.verificationStatus === 'verified' && effectiveAsaasStatus !== 'approved'
                      ? "Homologação de Pagamento"
                      : "Conta em Análise"}
              </h2>
              <div className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8 px-2 space-y-3">
                {isAsaasMissingProfile ? (
                  <>
                    <p>
                      Sua instituição já foi <strong className="text-emerald-700 font-bold">aprovada pela auditoria do DoeCerto</strong>! Para abrir automaticamente sua subconta no <strong className="text-[#6B39A7] font-bold">Asaas</strong>, falta apenas completar seu endereço e telefone em Editar Perfil.
                    </p>
                    {kycSummary?.missingFields && kycSummary.missingFields.length > 0 && (
                      <p className="text-sm text-purple-900 bg-purple-50 border border-purple-200 rounded-xl p-3">
                        Campos pendentes: <strong>{kycSummary.missingFields.join(", ")}</strong>.
                      </p>
                    )}
                  </>
                ) : effectiveAsaasStatus === 'rejected' ? (
                  <>
                    <p>
                      O <strong className="text-rose-700 font-bold">serviço de pagamentos (Asaas)</strong> solicitou ajustes nos documentos da sua subconta antes de liberar os recebimentos via Pix.
                    </p>
                    {kycSummary?.rejectReasons && (
                      <p className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-xl p-3">
                        Motivo: <strong>{kycSummary.rejectReasons}</strong>
                      </p>
                    )}
                  </>
                ) : ong.verificationStatus === 'verified' && effectiveAsaasStatus !== 'approved' ? (
                  <p>
                    Sua instituição já foi <strong className="text-emerald-700 font-bold">aprovada pela auditoria do DoeCerto</strong>! No momento, sua subconta exclusiva está em fase de homologação cadastral (KYC) pelo <strong className="text-amber-600 font-bold">serviço de pagamentos da plataforma (Asaas)</strong>. Após o envio dos documentos/selfie solicitados no card abaixo, a análise leva em média <strong className="text-slate-800">1 a 2 dias úteis</strong>.
                  </p>
                ) : (
                  <p>
                    O seu perfil já está criado! Neste momento, nosso time de <strong className="text-amber-600 font-bold">Compliance e Auditoria</strong> está avaliando as informações da sua instituição. Assim que aprovado, sua subconta no Asaas será criada automaticamente.
                  </p>
                )}
              </div>

              {isAsaasMissingProfile && (
                <button
                  onClick={() => {
                    setShowPendingModal(false);
                    router.push('/ong-profilesetup');
                  }}
                  className="w-full mb-3 py-4 bg-[#6B39A7] hover:bg-[#582a8c] text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Completar Endereço e Telefone</span>
                  <ArrowRight size={18} />
                </button>
              )}

              {ong.verificationStatus === 'verified' && kycSummary?.onboardingUrl && (
                <a
                  href={kycSummary.onboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPendingModal(false)}
                  className="w-full mb-3 py-4 bg-[#6B39A7] hover:bg-[#582a8c] text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Abrir Selfie / Validação no Asaas</span>
                  <ExternalLink size={18} />
                </a>
              )}

              {(!ong?.hasEstatuto || !ong?.hasAta) && (
                <button
                  onClick={() => {
                    setShowPendingModal(false);
                    setIsDocsModalOpen(true);
                  }}
                  className="w-full mb-3 py-4 bg-[#6B39A7] hover:bg-[#582a8c] text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  <span>Enviar Documentos para Homologação</span>
                </button>
              )}
              <button
                onClick={() => setShowPendingModal(false)}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Conta Restringida */}
      <AnimatePresence>
        {showRestrictedModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowRestrictedModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <button
                onClick={() => setShowRestrictedModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6 shadow-inner ring-4 ring-red-50">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Conta Restringida</h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium mb-6 px-1">
                Por medidas de conformidade e segurança da plataforma, a sua conta foi temporariamente <strong className="text-red-600 font-bold">restringida</strong> pela auditoria. Durante este período, o recebimento de doações e a exibição pública ficam suspensos.
              </p>

              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 text-left space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">O que fazer?</span>
                <p className="text-base text-slate-700 leading-relaxed font-medium">
                  Entre em contato com nossa equipe de suporte para regularizar a documentação ou obter mais detalhes.
                </p>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:contato@doecerto.net.br?subject=Suporte%20-%20Conta%20Restringida"
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-base shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
                >
                  Falar com Suporte
                </a>
                <button
                  onClick={() => setShowRestrictedModal(false)}
                  className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-base active:scale-[0.98] transition-all cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Exclusão de Conta LGPD */}
      <OngDocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        ong={ong}
        onSuccess={(updated) => {
          setOng((prev: any) => ({
            ...prev,
            ...updated,
            hasEstatuto: true,
            hasAta: true,
          }));
          void loadKycSummary();
        }}
      />

      <LgpdDeleteAccountModal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        userRole="ong"
      />
    </div>
  );
}
