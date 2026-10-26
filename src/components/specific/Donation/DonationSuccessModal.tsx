"use client";

import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import confirmAnimation from "@/assets/animations/confirmdonation.json";
import gsap from "gsap";
import {
  Check,
  Copy,
  Building2,
  Share2,
  X,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export interface DonationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number | string;
  formattedAmount: string;
  baseAmount?: number | string;
  formattedBaseAmount?: string;
  tipAmount?: number | string;
  formattedTipAmount?: string;
  ongData: {
    name?: string;
    cnpj?: string;
    logo?: string;
  } | null;
  impact?: {
    units?: number;
    unitLabel?: string;
    impactText?: string;
  } | null;
  primaryCategoryName?: string | null;
  paymentId?: string;
  trackingId?: string;
  donationId?: number | string;
  guestEmail?: string;
  isAuthenticated: boolean;
  onGoHome: () => void;
  onGoRegister?: () => void;
}

export default function DonationSuccessModal({
  isOpen,
  onClose,
  formattedAmount,
  formattedBaseAmount,
  tipAmount,
  formattedTipAmount,
  ongData,
  impact,
  primaryCategoryName,
  paymentId,
  trackingId,
  donationId,
  onGoHome,
}: DonationSuccessModalProps) {
  const [copiedAuth, setCopiedAuth] = useState(false);
  const [nowDateFormatted, setNowDateFormatted] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);

  const hasTip = Boolean(tipAmount && Number(tipAmount) > 0);

  // Formatação de data/hora atual
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setNowDateFormatted(`${dateStr} às ${timeStr}`);
  }, []);

  // Animação em 3 Etapas:
  // 1. Logo faz animação com ricochete no centro da tela
  // 2. Depois sobe para a posição de cabeçalho
  // 3. E abre o modal revelando o recibo
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 640;
      const targetTop = isMobile ? 20 : 24;

      // Posição base do checkmark alinhada ao cabeçalho do card
      gsap.set(checkmarkRef.current, {
        top: targetTop,
        left: 0,
        right: 0,
        margin: "0 auto",
      });

      // Mede a distância real até o centro exato da tela
      let deltaY = 200;
      if (checkmarkRef.current) {
        const rect = checkmarkRef.current.getBoundingClientRect();
        const iconCenterY = rect.top + rect.height / 2;
        const screenCenterY = window.innerHeight / 2;
        deltaY = screenCenterY - iconCenterY;
      }

      // 1. O card branco inicia invisível
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(cardRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 16,
        pointerEvents: "none",
        transformOrigin: "center center",
      });

      // 2. A logo/checkmark nasce no CENTRO DA TELA com scale: 0
      gsap.set(checkmarkRef.current, {
        top: targetTop,
        y: deltaY,
        scale: 0,
        opacity: 0,
        transformOrigin: "center center",
      });

      const tl = gsap.timeline();

      // Fundo escurece limpo (sem blur)
      tl.to(
        backdropRef.current,
        {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        },
        0
      );

      // ETAPA 1: A LOGO FAZ A ANIMAÇÃO COM RICOCHETE NO CENTRO DA TELA
      tl.to(
        checkmarkRef.current,
        {
          opacity: 1,
          scale: 1.35,
          duration: 0.65,
          ease: "elastic.out(1.4, 0.4)",
        },
        0.05
      );

      // ETAPA 2: DEPOIS SOBE PARA O CABEÇALHO
      tl.to(
        checkmarkRef.current,
        {
          y: 0,
          scale: 1.0,
          duration: 0.45,
          ease: "power3.inOut",
        },
        1.15
      );

      // ETAPA 3: E ABRE O MODAL
      tl.to(
        cardRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => {
            if (cardRef.current) {
              gsap.set(cardRef.current, {
                clearProps: "transform",
                pointerEvents: "auto",
              });
            }
          },
        },
        1.25
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Fechamento suave com fade-out
  const handleCloseModal = () => {
    if (cardRef.current && backdropRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 12,
        duration: 0.18,
        ease: "power2.in",
      });
      if (checkmarkRef.current) {
        gsap.to(checkmarkRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.18,
          ease: "power2.in",
        });
      }
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.18,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const rawAuthCode =
    trackingId ||
    paymentId ||
    (donationId ? `DC-${donationId}` : "AUT-PIX-BCB");

  const displayAuthCode =
    rawAuthCode.length > 18
      ? `${rawAuthCode.slice(0, 8)}...${rawAuthCode.slice(-6)}`
      : rawAuthCode;

  const handleCopyAuth = () => {
    if (!rawAuthCode) return;
    navigator.clipboard.writeText(String(rawAuthCode)).then(() => {
      setCopiedAuth(true);
      setTimeout(() => setCopiedAuth(false), 2000);
    });
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "DoeCerto - Comprovante de Doação",
          text: `Acabei de doar R$ ${formattedBaseAmount || formattedAmount} via Pix para ${ongData?.name || "a instituição"} pelo DoeCerto. Faça a sua parte também!`,
          url: typeof window !== "undefined" ? window.location.origin : "https://doecerto.com.br",
        });
      } catch {
        // Cancelado pelo usuário
      }
    } else {
      handleCopyAuth();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop limpo e escuro */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/60"
        onClick={handleCloseModal}
      />

      {/* Wrapper do Modal centralizado */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-[700px]">
        {/* 1. O CARD DO RECIBO BRANCO */}
        <div
          ref={cardRef}
          className="relative bg-white rounded-3xl sm:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] border border-slate-100 w-full py-5 sm:py-6 px-7 sm:px-10 md:px-12 text-slate-800 max-h-[96vh] flex flex-col justify-between"
          style={{ opacity: 0 }}
        >
          {/* Botão de Fechar discreto */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Fechar"
          >
            <X size={16} />
          </button>

          {/* Slot de cabeçalho onde o Checkmark vai atracar perfeitamente */}
          <div
            ref={slotRef}
            className="w-22 h-22 sm:w-24 sm:h-24 mx-auto shrink-0 mb-1 pointer-events-none"
          />

          {/* 2. TÍTULO E VALOR HERO EM DESTAQUE NÍTIDO */}
          <div className="text-center mt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Doação Confirmada
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-0.5">
              Transferência Pix liquidada com sucesso
            </p>

            {/* Valor Principal */}
            <div className="mt-2.5 mb-1.5">
              <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight font-mono">
                R$ {formattedAmount}
              </span>
            </div>

            {/* Tag de status */}
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-semibold border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Liquidado via Banco Central</span>
            </div>
          </div>

          {/* 3. RECIBO DETALHADO */}
          <div className="mt-4 sm:mt-5 border-t border-b border-slate-100 divide-y divide-slate-100/90 text-sm sm:text-base">
            {/* Beneficiário */}
            <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Beneficiário</span>
              <div className="flex items-center gap-2.5 text-right min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {ongData?.logo ? (
                    <img
                      src={ongData.logo}
                      alt={ongData?.name || "ONG"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={15} className="text-[#6B39A7]" />
                  )}
                </div>
                <div className="truncate">
                  <span className="font-bold text-slate-900 block text-base sm:text-lg truncate">
                    {ongData?.name || "ONG Beneficiada"}
                  </span>
                  {ongData?.cnpj && (
                    <span className="text-xs sm:text-sm font-mono text-slate-400 block font-medium">
                      CNPJ: {ongData.cnpj}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhamento da Doação e Gorjeta se houver */}
            {hasTip && formattedBaseAmount && (
              <>
                <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Doação para a Instituição</span>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {formattedBaseAmount}
                  </span>
                </div>
                <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <HeartHandshake size={15} className="text-[#6B39A7]" />
                    <span>Apoio voluntário ao DoeCerto</span>
                  </span>
                  <span className="font-mono font-bold text-[#6B39A7]">
                    + R$ {formattedTipAmount}
                  </span>
                </div>
              </>
            )}

            {/* Causa */}
            {primaryCategoryName && (
              <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">Causa</span>
                <span className="font-semibold text-slate-800">
                  {primaryCategoryName}
                </span>
              </div>
            )}

            {/* Data e Hora */}
            <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Data e hora</span>
              <span className="font-semibold text-slate-800">
                {nowDateFormatted || "Hoje"}
              </span>
            </div>

            {/* Forma de Pagamento */}
            <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Método</span>
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Pix Dinâmico Oficial (Asaas)
              </span>
            </div>

            {/* Autenticação com Copiar */}
            <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Autenticação</span>
              <button
                type="button"
                onClick={handleCopyAuth}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-xs sm:text-sm font-semibold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar código de autenticação"
              >
                <span>{displayAuthCode}</span>
                {copiedAuth ? (
                  <Check size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Copy size={13} className="text-slate-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 4. IMPACTO SOCIAL */}
          {impact?.impactText && (
            <div className="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 sm:px-4 flex items-start gap-2.5 text-left">
              <Sparkles size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                {impact.impactText}
              </p>
            </div>
          )}

          {/* 5. AÇÕES LADO A LADO */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="w-full sm:w-auto sm:flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs order-2 sm:order-1"
            >
              <Share2 size={16} />
              <span>Compartilhar</span>
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="w-full sm:w-auto sm:flex-[1.3] h-12 bg-[#6B39A7] hover:bg-[#592d8f] text-white rounded-xl font-bold text-sm sm:text-base shadow-md shadow-purple-600/20 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer order-1 sm:order-2"
            >
              Concluir Doação
            </button>
          </div>

          {/* 6. ASSINATURA DE SEGURANÇA */}
          <div className="mt-3.5 pt-2 border-t border-slate-100/60 text-center">
            <p className="text-xs sm:text-sm text-slate-400 inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>DoeCerto · Ambiente auditado e integrado ao Banco Central</span>
            </p>
          </div>
        </div>

        {/* 2. A LOGO / CHECKMARK */}
        <div
          ref={checkmarkRef}
          className="absolute left-0 right-0 mx-auto flex items-center justify-center pointer-events-none z-30 w-22 h-22 sm:w-24 sm:h-24 aspect-square shrink-0"
          style={{ opacity: 0 }}
        >
          <Lottie
            animationData={confirmAnimation}
            loop={false}
            autoplay={true}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
