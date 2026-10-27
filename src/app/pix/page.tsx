"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, Building2, IdCard,
  Key, Copy, CheckCircle2,
  X, Lock, ShieldCheck, Heart, AlertCircle, AlertTriangle,
  RefreshCw, Clock, User, Mail, HeartHandshake
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo, useRef } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import DonationTutorialModal from "@/components/ui/DonationTutorial";
import { calculateImpact } from "@/utils/impactCalculator";
import { formatCPF, validateCPF, removeFormatting } from "@/utils/documentValidation";
import DonationSuccessModal from "@/components/specific/Donation/DonationSuccessModal";
import SlideCommit from "@/components/ui/SlideCommit";

// ==========================================
// TEXTO DE IMPACTO SOCIAL TYPEWRITER
// ==========================================

function TypewriterImpactText({
  targetText,
  prefix = "Sua doação ajuda a viabilizar"
}: {
  targetText: string;
  prefix?: string;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const currentTextRef = useRef("");
  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    if (currentTextRef.current !== targetText) {
      setIsTyping(true);
    }

    const tick = () => {
      if (isCancelled) return;

      const current = currentTextRef.current;
      const target = targetTextRef.current;

      if (current === target) {
        setIsTyping(false);
        return;
      }

      setIsTyping(true);

      if (!target.startsWith(current)) {
        const next = current.slice(0, -1);
        currentTextRef.current = next;
        setDisplayedText(next);
        timeoutId = setTimeout(tick, 10);
      } else {
        const next = target.slice(0, current.length + 1);
        currentTextRef.current = next;
        setDisplayedText(next);
        timeoutId = setTimeout(tick, 20);
      }
    };

    tick();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [targetText]);

  const hasPrefix = displayedText.startsWith(prefix);
  const prefixPart = hasPrefix ? prefix : displayedText;
  const dynamicPart = hasPrefix ? displayedText.slice(prefix.length).trimStart() : "";

  return (
    <p className="text-slate-600 text-base sm:text-lg font-medium leading-normal min-h-[28px] flex items-center flex-wrap">
      <span>{prefixPart}</span>
      {dynamicPart && (
        <strong className="text-purple-700 font-bold ml-1.5">{dynamicPart}</strong>
      )}
      {isTyping && (
        <span className="inline-block w-[2px] h-[1.1em] bg-purple-700 ml-1 align-middle animate-pulse" />
      )}
    </p>
  );
}

// ==========================================
// TIPOS DO FLUXO
// ==========================================
type FlowStep = "amount" | "identification" | "payment";

interface DynamicPixData {
  donationId: number | string;
  trackingId?: string;
  paymentId: string;
  amount: number;
  netValue: number;
  fee: number;
  copyPaste: string;
  qrCodeBase64?: string;
  expiresAt?: string | null;
  createdAt?: string | null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function PixPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ongId = searchParams.get("id");
  const initialValor = searchParams.get("valor") || "20";
  const urlStep = searchParams.get("step");

  const [step, setStep] = useState<FlowStep>(() => {
    if (urlStep === "identificacao" || urlStep === "identification") return "identification";
    if (urlStep === "pagamento" || urlStep === "payment") return "payment";
    return "amount";
  });

  const { isAuthenticated, userRole } = useAuth();
  const isOngUser = isAuthenticated && userRole === "ong";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Estados de identificação rápida do visitante (Guest Checkout - Padrão Fintech Enterprise)
  const [guestName, setGuestName] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dc_guest_name") || "";
    }
    return "";
  });
  const [guestEmailInput, setGuestEmailInput] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dc_guest_email") || "";
    }
    return "";
  });
  const [guestCpf, setGuestCpf] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dc_guest_cpf") || "";
    }
    return "";
  });
  const [guestFormError, setGuestFormError] = useState<string | null>(null);

  const [ongData, setOngData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [valor, setValor] = useState(initialValor);
  const valoresRapidos = ["5", "10", "20", "50", "100"];

  // Estados do Tip Model (Apoio voluntário à plataforma DoeCerto)
  const [tipOption, setTipOption] = useState<"0" | "5" | "10" | "15" | "custom">(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("dc_tip_option");
      if (saved === "0" || saved === "5" || saved === "10" || saved === "15" || saved === "custom") {
        return saved;
      }
    }
    return "10";
  });
  const [customTip, setCustomTip] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dc_custom_tip") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("dc_tip_option", tipOption);
        if (customTip) sessionStorage.setItem("dc_custom_tip", customTip);
        else sessionStorage.removeItem("dc_custom_tip");
      } catch (e) { }
    }
  }, [tipOption, customTip]);

  // Cálculos do valor base para a ONG, gorjeta voluntária e valor total
  const baseAmount = useMemo(() => {
    const num = parseFloat(valor);
    return isNaN(num) || num < 0 ? 0 : num;
  }, [valor]);

  const tipAmount = useMemo(() => {
    if (tipOption === "0" || baseAmount <= 0) return 0;
    if (tipOption === "custom") {
      const parsed = parseFloat(customTip.replace(",", "."));
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    const pct = parseInt(tipOption, 10);
    if (isNaN(pct) || pct <= 0) return 0;
    return Math.round(baseAmount * pct) / 100;
  }, [baseAmount, tipOption, customTip]);

  const totalAmount = useMemo(() => {
    return Math.round((baseAmount + tipAmount) * 100) / 100;
  }, [baseAmount, tipAmount]);

  const formattedBaseDisplay = useMemo(() => {
    return baseAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [baseAmount]);

  const formattedTipDisplay = useMemo(() => {
    return tipAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [tipAmount]);

  const formattedTotalDisplay = useMemo(() => {
    return totalAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [totalAmount]);

  const formattedValorDisplay = formattedTotalDisplay;

  const handleTipOptionClick = (optionId: "0" | "5" | "10" | "15" | "custom") => {
    if (tipOption === optionId) {
      setTipOption("0");
      setCustomTip("");
    } else {
      setTipOption(optionId);
    }
  };

  // Estados Asaas (Pix Dinâmico)
  const [dynamicPix, setDynamicPix] = useState<DynamicPixData | null>(() => {
    if (typeof window !== "undefined" && ongId && initialValor) {
      try {
        const cached = sessionStorage.getItem(`dc_dynpix_${ongId}_${initialValor}`);
        if (cached) {
          const parsed = JSON.parse(cached) as DynamicPixData;
          if (parsed && parsed.copyPaste) return parsed;
        }
      } catch (e) {
        // noop
      }
    }
    return null;
  });

  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [dynamicPixError, setDynamicPixError] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const lastRequestedAmountRef = useRef<number | null>(null);

  // Calcula o tempo restante baseado em um timestamp fixo no relógio real (20 min)
  const calculateRemainingSeconds = (activeValor?: string, pixData?: DynamicPixData | null) => {
    const currentPix = pixData !== undefined ? pixData : dynamicPix;

    if (currentPix?.createdAt) {
      const createdMs = new Date(currentPix.createdAt).getTime();
      if (!isNaN(createdMs)) {
        const windowEnd = createdMs + 20 * 60 * 1000;
        return Math.max(0, Math.floor((windowEnd - Date.now()) / 1000));
      }
    }

    if (currentPix?.expiresAt) {
      const expMs = new Date(currentPix.expiresAt).getTime();
      if (!isNaN(expMs)) {
        const diffSeconds = Math.floor((expMs - Date.now()) / 1000);
        return Math.max(0, diffSeconds);
      }
    }

    const targetValor = activeValor || valor;
    if (typeof window !== "undefined" && ongId && targetValor) {
      try {
        const stored = sessionStorage.getItem(`dc_pix_exp_${ongId}_${targetValor}`);
        if (stored) {
          const expTime = parseInt(stored, 10);
          if (!isNaN(expTime)) {
            const diffSeconds = Math.floor((expTime - Date.now()) / 1000);
            if (diffSeconds > 0 && diffSeconds <= 1200) {
              return diffSeconds;
            }
          }
        }
      } catch (e) {
        // noop
      }
    }
    return 1199;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => calculateRemainingSeconds(initialValor));
  const isExpired = timeLeft <= 0;

  const displayCode = useMemo(() => {
    if (dynamicPix?.trackingId) return String(dynamicPix.trackingId);
    if (dynamicPix?.donationId) return String(dynamicPix.donationId);
    if (ongId) return `${ongId}${String(Date.now()).slice(-4)}`;
    return "1024";
  }, [dynamicPix?.trackingId, dynamicPix?.donationId, ongId]);

  const clearPixSessionData = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("doecerto:guestDonorEmail");
      sessionStorage.removeItem("doecerto:guestDonorPhone");
      sessionStorage.removeItem("dc_guest_name");
      sessionStorage.removeItem("dc_guest_email");
      sessionStorage.removeItem("dc_guest_cpf");
      sessionStorage.removeItem("dc_tip_option");
      sessionStorage.removeItem("dc_custom_tip");
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("dc_dynpix_") || key.startsWith("dc_pix_exp_")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // noop
    }
  };

  const handleExitPix = () => {
    clearPixSessionData();
    if (ongId) {
      router.replace(`/ong-public-profile?id=${ongId}`);
    } else {
      router.replace("/home");
    }
  };

  const navigateToStep = (newStep: FlowStep, valorOverride?: string) => {
    setStep(newStep);
    setErrorMessage(null);
    setGuestFormError(null);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const activeValor = valorOverride || valor;
      if (activeValor) params.set("valor", activeValor);

      if (newStep === "amount") {
        params.delete("step");
      } else if (newStep === "identification") {
        params.set("step", "identificacao");
      } else if (newStep === "payment") {
        params.set("step", "pagamento");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackFromPayment = () => {
    navigateToStep("amount");
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("step");
      const v = params.get("valor");
      if (v) setValor(v);
      if (s === "identificacao" || s === "identification") {
        setStep("identification");
      } else if (s === "pagamento" || s === "payment") {
        setStep("payment");
      } else {
        setStep("amount");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (step !== "payment") return;

    const syncRemaining = () => {
      const remaining = calculateRemainingSeconds(valor, dynamicPix);
      setTimeLeft(remaining);
      return remaining;
    };

    const initialRemaining = syncRemaining();
    if (initialRemaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = syncRemaining();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, ongId, valor, dynamicPix]);

  const formattedCountdown = useMemo(() => {
    if (timeLeft <= 0) return "00:00";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes} minutos e ${seconds < 10 ? "0" : ""}${seconds} segundos`;
  }, [timeLeft]);

  const generateDynamicPix = async (
    donationBase = baseAmount,
    donationTip = tipAmount,
    anonymous = isAnonymous
  ) => {
    if (!ongId || isNaN(donationBase) || donationBase < 5) return null;
    setIsGeneratingPix(true);
    setDynamicPixError(null);
    try {
      const response = await api<DynamicPixData>("/donations/pix-dinamico", {
        method: "POST",
        body: JSON.stringify({
          ongId: Number(ongId),
          amount: donationBase,
          tipAmount: donationTip > 0 ? donationTip : 0,
          isAnonymous: anonymous,
        }),
      });
      const data = response.data;
      setDynamicPix(data);
      lastRequestedAmountRef.current = totalAmount;
      setIsPaymentConfirmed(false);
      setCopied(false);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`dc_dynpix_${ongId}_${totalAmount}`, JSON.stringify(data));
          const validExpMs = Date.now() + 20 * 60 * 1000;
          sessionStorage.setItem(`dc_pix_exp_${ongId}_${totalAmount}`, String(validExpMs));
        } catch (e) { }
      }

      setTimeLeft(1199);
      return data;
    } catch (err: any) {
      console.error("Erro ao gerar Pix Dinâmico:", err);
      const msg = err?.message || "Não foi possível gerar seu Pix no momento. Tente novamente.";
      setDynamicPixError(msg);
      throw err;
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleRegeneratePix = async () => {
    if (baseAmount < 5) return;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`dc_dynpix_${ongId}_${totalAmount}`);
        sessionStorage.removeItem(`dc_pix_exp_${ongId}_${totalAmount}`);
      } catch (e) {
        // noop
      }
    }
    setCopied(false);
    setDynamicPix(null);

    if (isAuthenticated && userRole === "donor") {
      try {
        await generateDynamicPix(baseAmount, tipAmount, isAnonymous);
      } catch (err: any) {
        console.error("Erro ao renovar Pix Dinâmico:", err);
      }
    } else if (!isAuthenticated && guestName && guestEmailInput && guestCpf) {
      try {
        await handleGuestSubmit();
      } catch (err: any) {
        console.error("Erro ao renovar Pix do Visitante:", err);
      }
    } else {
      navigateToStep("identification", String(totalAmount));
    }
  };

  const handleGuestSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGuestFormError(null);

    if (baseAmount < 5) {
      setGuestFormError("O valor mínimo para doação via Pix Dinâmico é de R$ 5,00.");
      return;
    }

    const trimmedName = guestName.trim();
    if (trimmedName.length < 3) {
      setGuestFormError("Informe seu nome completo (pelo menos 3 caracteres).");
      return;
    }

    const trimmedEmail = (guestEmailInput || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setGuestFormError("Informe seu e-mail para envio do comprovante e recibo fiscal.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setGuestFormError("Informe um e-mail válido para receber o comprovante e recibo fiscal.");
      return;
    }

    const cleanCpf = removeFormatting(guestCpf);
    if (!validateCPF(cleanCpf)) {
      setGuestFormError("CPF inválido. Por favor, confira os números digitados.");
      return;
    }

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("dc_guest_name", trimmedName);
        sessionStorage.setItem("dc_guest_email", trimmedEmail);
        sessionStorage.setItem("dc_guest_cpf", guestCpf);
      } catch (err) { }
    }

    setIsGeneratingPix(true);
    setDynamicPixError(null);

    try {
      const response = await api<DynamicPixData>("/donations/pix-dinamico/guest", {
        method: "POST",
        body: JSON.stringify({
          ongId: Number(ongId),
          amount: baseAmount,
          tipAmount: tipAmount > 0 ? tipAmount : 0,
          name: trimmedName,
          email: trimmedEmail || undefined,
          cpf: cleanCpf,
          isAnonymous: true,
        }),
      });

      const data = response.data;
      setDynamicPix(data);
      lastRequestedAmountRef.current = totalAmount;
      setIsPaymentConfirmed(false);
      setCopied(false);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`dc_dynpix_${ongId}_${totalAmount}`, JSON.stringify(data));
          const validExpMs = Date.now() + 20 * 60 * 1000;
          sessionStorage.setItem(`dc_pix_exp_${ongId}_${totalAmount}`, String(validExpMs));
        } catch (e) { }
      }

      setTimeLeft(1199);
      navigateToStep("payment", String(totalAmount));
    } catch (err: any) {
      console.error("Erro ao gerar Pix do Visitante:", err);
      const msg = err?.message || "Não foi possível gerar seu Pix no momento. Tente novamente.";
      setGuestFormError(msg);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleAvancarParaPagamento = async () => {
    if (baseAmount < 5) {
      setErrorMessage("O valor mínimo para doação via Pix é de R$ 5,00.");
      throw new Error("O valor mínimo para doação via Pix é de R$ 5,00.");
    }

    if (isOngUser) {
      setErrorMessage("Contas institucionais não podem realizar doações. Para doar, entre com uma conta de doador.");
      throw new Error("Contas institucionais não podem realizar doações.");
    }

    // 1. Doador logado: Gera Pix Dinâmico Asaas direto (já temos os dados da conta)
    if (isAuthenticated && userRole === "donor") {
      try {
        const pixData = await generateDynamicPix(baseAmount, tipAmount, isAnonymous);
        setTimeLeft(calculateRemainingSeconds(String(totalAmount), pixData));
        navigateToStep("payment", String(totalAmount));
      } catch (err: any) {
        setErrorMessage(err?.message || "Falha ao gerar o QR Code no Asaas. Tente novamente.");
        throw err;
      }
      return;
    }

    // 2. Visitante (deslogado): Identificação Rápida em 1 card (Padrão Fintech Enterprise)
    navigateToStep("identification", String(totalAmount));
  };

  // Garante que se o usuário recarregar (F5) na etapa de pagamento, o QR Code é restaurado do cache ou gerado imediatamente
  useEffect(() => {
    if (step !== "payment" || initialLoading) return;

    if (totalAmount < 5) return;

    // Se já estiver com o dynamicPix carregado para o valor atual, apenas sincroniza
    if (dynamicPix && dynamicPix.amount === totalAmount && dynamicPix.copyPaste) {
      setTimeLeft(calculateRemainingSeconds(String(totalAmount), dynamicPix));
      return;
    }

    // 1. Tenta restaurar do cache de sessão
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`dc_dynpix_${ongId}_${totalAmount}`);
        if (cached) {
          const parsed = JSON.parse(cached) as DynamicPixData;
          if (parsed && parsed.copyPaste && parsed.amount === totalAmount) {
            setDynamicPix(parsed);
            lastRequestedAmountRef.current = totalAmount;
            setTimeLeft(calculateRemainingSeconds(String(totalAmount), parsed));
            return;
          }
        }
      } catch (e) {
        // noop
      }
    }

    // 2. Se não estiver no cache e não estiver gerando, gera automaticamente se for doador logado
    if (!isGeneratingPix && isAuthenticated && userRole === "donor") {
      generateDynamicPix(baseAmount, tipAmount, isAnonymous).catch((err) => {
        console.error("Erro ao gerar Pix ao atualizar a página:", err);
      });
    }
  }, [step, dynamicPix, isGeneratingPix, initialLoading, totalAmount, baseAmount, tipAmount, ongId, isAnonymous, isAuthenticated, userRole]);

  // Polling automático de compensação Pix (imediato + a cada 3 segundos)
  useEffect(() => {
    if (!dynamicPix?.donationId || isPaymentConfirmed || showPopup || step !== "payment" || isExpired) return;

    let isMounted = true;
    const controller = new AbortController();

    const checkStatus = async () => {
      if (!isMounted || isPaymentConfirmed || showPopup) return;
      try {
        const trackingKey = dynamicPix.trackingId || dynamicPix.donationId;
        const res = await api<{ donationStatus: string }>(`/donations/${trackingKey}/status`, {
          signal: controller.signal,
        });
        if (isMounted && res.data?.donationStatus === "completed") {
          setIsPaymentConfirmed(true);
          setShowPopup(true);
          clearPixSessionData();

          // Limpa step=pagamento da URL para que se o usuário der F5, não fique preso na cobrança já paga
          if (typeof window !== "undefined") {
            const cleanUrl = `${window.location.pathname}?id=${ongId}`;
            window.history.replaceState(null, "", cleanUrl);
          }
        }
      } catch (e: any) {
        // Ignora silenciosamente se o componente foi desmontado ou requisição abortada durante navegação
        if (!isMounted || controller.signal.aborted || e?.name === "AbortError") return;
        if (e instanceof TypeError && e.message?.includes("fetch")) return;
        console.error("Erro ao verificar status do Pix:", e);
      }
    };

    // Executa verificação instantânea na entrada ou recarregamento
    checkStatus();

    const interval = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [dynamicPix?.donationId, dynamicPix?.trackingId, isPaymentConfirmed, showPopup, step, isExpired]);

  // Sincroniza expiração de 20 min com o gateway
  useEffect(() => {
    if (isExpired && dynamicPix?.donationId && !isPaymentConfirmed) {
      const trackingKey = dynamicPix.trackingId || dynamicPix.donationId;
      api(`/donations/${trackingKey}/expire`, { method: "POST" }).catch((err: unknown) => {
        console.warn("Aviso ao sincronizar expiração do Pix no backend:", err);
      });
    }
  }, [isExpired, dynamicPix?.donationId, dynamicPix?.trackingId, isPaymentConfirmed]);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  useEffect(() => {
    const hideLocal = localStorage.getItem("hideDonationTutorial");
    const hideSession = sessionStorage.getItem("hideDonationTutorial");
    if (hideLocal !== "true" && hideSession !== "true") {
      setIsTutorialOpen(true);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!ongId) return;
      try {
        setInitialLoading(true);
        const idNum = Number(ongId);
        const profile = await OngsProfileService.getPublicProfile(idNum).catch(() => null);
        if (profile) setOngData(profile);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, [ongId, router]);

  const primaryCategoryName = useMemo(() => {
    return ongData?.primaryCategory?.name || ongData?.categories?.[0]?.name || null;
  }, [ongData]);

  const impact = useMemo(() => {
    return calculateImpact({
      amount: baseAmount,
      primaryCategoryName,
      donationType: "monetary",
    });
  }, [baseAmount, primaryCategoryName]);

  const activePixCopiaECola = dynamicPix?.copyPaste || "";

  const copyKey = () => {
    if (!activePixCopiaECola || isExpired) return;
    navigator.clipboard.writeText(activePixCopiaECola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans overflow-x-hidden antialiased">
      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-10">

        {/* ALERTA DE CONTA DE ONG */}
        {isOngUser && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-amber-900">Você está conectado com uma conta de ONG</h4>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                Contas institucionais não podem realizar doações. Para doar, saia desta conta ou utilize um e-mail pessoal de doador.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 1: SELEÇÃO DE VALOR E IDENTIFICAÇÃO (PADRÃO FINTECH DOECERTO)
            ========================================================================= */}
        {step === "amount" && (
          <div className="space-y-6 sm:space-y-8">

            {/* CABEÇALHO FINTECH */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitPix}
                aria-label="Voltar para a instituição"
                title="Voltar para a página da instituição"
                className="bg-white p-2.5 rounded-full shadow-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Doação via Pix</h1>
                <p className="text-slate-600 text-base sm:text-lg font-medium mt-1">
                  Contribuição direta e 100% repassada para a instituição.
                </p>
              </div>
            </div>

            {/* HERO CARD: A INSTITUIÇÃO BENEFICIÁRIA */}
            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90 relative overflow-hidden">
              <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {ongData?.logo ? (
                    <img src={ongData.logo} alt={ongData?.name || "Logo"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg sm:text-2xl font-mono">
                      {ongData?.name ? ongData.name.charAt(0).toUpperCase() : <Building2 size={22} />}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                      <ShieldCheck size={16} className="text-emerald-600" /> Instituição Verificada
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                      Checkout Oficial
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight truncate tracking-tight">
                    {ongData?.name || "Carregando..."}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-sm sm:text-base font-medium mt-1.5">
                    <IdCard size={18} className="shrink-0 text-slate-400" />
                    <span>
                      CNPJ: <strong className="font-mono text-slate-800 font-bold text-sm sm:text-base">{ongData?.cnpj || "Não informado"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* DESTAQUES DE SEGURANÇA E AUDITORIA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3.5 sm:pt-4">
                <div className="bg-slate-50/90 border border-slate-200/80 p-3 rounded-xl flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Checkout Oficial</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">Pix Dinâmico Banco Central</p>
                  </div>
                </div>
                <div className="bg-slate-50/90 border border-slate-200/80 p-3 rounded-xl flex items-center gap-2.5">
                  <Lock size={20} className="text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Conciliação 100%</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">Automação Asaas sem Recibo</p>
                  </div>
                </div>
                <div className="bg-slate-50/90 border border-slate-200/80 p-3 rounded-xl flex items-center gap-2.5 sm:col-span-1">
                  <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Destino Seguro</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">Repasse Direto à Instituição</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD DE DEFINIÇÃO DO VALOR */}
            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90 space-y-5">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Defina o valor da contribuição
                </h3>
                {valor && impact && impact.units > 0 ? (
                  <TypewriterImpactText
                    targetText={`Sua doação ajuda a viabilizar ${impact.units === 1 ? `1 ${impact.unitLabel}` : `${impact.units} ${impact.unitLabel}`}.`}
                  />
                ) : (
                  <p className="text-slate-600 text-base sm:text-lg font-medium mt-1 leading-normal min-h-[28px]">
                    100% do valor vai direto para a conta oficial da instituição.
                  </p>
                )}
              </div>

              {/* BOTÕES DE VALORES RÁPIDOS */}
              <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-1.5 sm:gap-2.5">
                {valoresRapidos.map((v) => {
                  const isSelected = valor === v;
                  const isSuggested = v === "20";
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        if (valor === v) {
                          setValor("");
                        } else {
                          setValor(v);
                        }
                      }}
                      className={`relative flex-1 min-w-[62px] sm:min-w-0 flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 rounded-xl text-base sm:text-lg font-bold transition-all cursor-pointer ${isSelected
                        ? "bg-purple-50/80 border-2 border-[#6B39A7] text-[#6B39A7] shadow-xs ring-2 ring-purple-100"
                        : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                        }`}
                    >
                      <span className="font-mono text-lg sm:text-xl font-black">R$ {v}</span>
                      {isSuggested && (
                        <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded mt-1 ${isSelected ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"
                          }`}>
                          Sugerido
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CAMPO DE VALOR CUSTOMIZADO */}
              <div className="relative group w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                  <span className="font-bold text-lg sm:text-xl text-slate-400">R$</span>
                </div>
                <input
                  type="number"
                  min="5"
                  step="any"
                  placeholder="Ou digite outro valor (mínimo R$ 5,00)"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-slate-50/60 border-2 border-slate-200 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 rounded-xl py-3.5 sm:py-4 pl-12 pr-4 font-bold text-lg sm:text-xl text-slate-900 transition-all outline-none placeholder:font-medium placeholder:text-base sm:placeholder:text-lg placeholder:text-slate-400 font-mono"
                />
              </div>

              {/* IDENTIFICAÇÃO DO DOADOR */}
              <div className="pt-2">
                {isAuthenticated ? (
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-[#6B39A7] accent-[#6B39A7] cursor-pointer shrink-0"
                    />
                    <span className="text-base sm:text-lg font-bold text-slate-800">
                      Ocultar meu nome (Doar anonimamente)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-xl bg-purple-50 border border-purple-200/80 text-slate-800 shadow-xs">
                    <ShieldCheck size={22} className="text-[#6B39A7] shrink-0" />
                    <span className="text-base sm:text-lg font-medium text-slate-800 leading-snug">
                      Doação rápida e anônima via Pix Dinâmico sem necessidade de cadastro prévio.
                    </span>
                  </div>
                )}
              </div>

              {/* ==========================================
                  TIP MODEL: APOIO VOLUNTÁRIO AO DOECERTO (FINTECH)
                  ========================================== */}
              {/* ==========================================
                  TIP MODEL: APOIO VOLUNTÁRIO AO DOECERTO (FINTECH HIGH-CONTRAST)
                  ========================================== */}
              <div className="bg-slate-50/80 border-2 border-slate-200/90 rounded-2xl p-5 sm:p-7 space-y-5">
                
                {/* CABEÇALHO DO APOIO */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <HeartHandshake size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        Apoio voluntário ao DoeCerto
                      </h3>
                      <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                        Opcional
                      </span>
                    </div>
                    <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed mt-1.5">
                      O DoeCerto não retém porcentagem das doações para as ONGs (0% de comissão). Adicione uma gorjeta voluntária para manter nossos servidores e auditoria funcionando com tecnologia gratuita para centenas de causas.
                    </p>
                  </div>
                </div>

                {/* BOTÕES DE PORCENTAGEM / PILLS COM TIPOGRAFIA GRANDE E NÍTIDA */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 pt-1">
                  {[
                    { id: "0", label: "0%", sub: "Nenhum" },
                    { id: "5", label: "5%", sub: `+ R$ ${(baseAmount * 0.05).toFixed(2).replace(".", ",")}` },
                    { id: "10", label: "10%", sub: `+ R$ ${(baseAmount * 0.10).toFixed(2).replace(".", ",")}`, badge: "Sugerido" },
                    { id: "15", label: "15%", sub: `+ R$ ${(baseAmount * 0.15).toFixed(2).replace(".", ",")}` },
                    { id: "custom", label: "Outro", sub: "Livre" },
                  ].map((option) => {
                    const isSelected = tipOption === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleTipOptionClick(option.id as any)}
                        className={`relative flex flex-col items-center justify-center py-3 sm:py-3.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#6B39A7] text-white border-2 border-[#6B39A7] shadow-md shadow-purple-900/25 ring-2 ring-purple-300"
                            : "bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-100/70 shadow-2xs"
                        } ${option.id === "custom" ? "col-span-2 sm:col-span-1" : ""}`}
                      >
                        {option.badge && (
                          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 ${
                            isSelected ? "bg-white/20 text-white" : "bg-purple-100 text-purple-900"
                          }`}>
                            {option.badge}
                          </span>
                        )}
                        <span className="font-mono text-xl sm:text-2xl font-black leading-tight">
                          {option.label}
                        </span>
                        <span className={`text-xs sm:text-sm font-bold mt-0.5 leading-tight ${
                          isSelected ? "text-purple-100" : "text-slate-600"
                        }`}>
                          {option.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* CAMPO PARA VALOR CUSTOMIZADO SE "OUTRO" ESTIVER ATIVO */}
                {tipOption === "custom" && (
                  <div className="p-4 bg-white rounded-xl border-2 border-purple-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-base sm:text-lg font-bold text-slate-800">
                        Digite o valor da gorjeta voluntária:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTipOption("0");
                          setCustomTip("");
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Fechar e remover gorjeta personalizada"
                      >
                        <X size={15} />
                        <span>Cancelar</span>
                      </button>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg sm:text-xl text-slate-400">
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Ex: 5,00"
                        value={customTip}
                        autoFocus
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100 rounded-xl font-mono font-bold text-lg sm:text-xl text-slate-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* EXTRATO DE TRANSPARÊNCIA FINTECH ABERTO (SEM CAIXA DENTRO DE CAIXA) */}
                <div className="border-t-2 border-slate-200/90 pt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-base sm:text-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-800 truncate">
                        Doação para {ongData?.name || "a instituição"}
                      </span>
                      <span className="shrink-0 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                        100% repassado
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-lg sm:text-xl shrink-0">
                      R$ {formattedBaseDisplay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        Apoio voluntário ao DoeCerto
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md">
                        {tipOption === "0" ? "0%" : tipOption === "custom" ? "Livre" : `${tipOption}%`}
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-lg sm:text-xl shrink-0 ${
                      tipAmount > 0 ? "text-[#6B39A7]" : "text-slate-500"
                    }`}>
                      {tipAmount > 0 ? `+ R$ ${formattedTipDisplay}` : "R$ 0,00"}
                    </span>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 block leading-tight">
                        Total do Pix
                      </span>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Cobrança única e segura
                      </span>
                    </div>
                    <span className="font-mono font-black text-2xl sm:text-3xl text-[#6B39A7]">
                      R$ {formattedTotalDisplay}
                    </span>
                  </div>
                </div>

              </div>

              {/* MENSAGEM DE ERRO SE HOUVER */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-medium flex-1">{errorMessage}</p>
                  <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* BOTÃO PRINCIPAL DE AVANÇAR */}
              <div className="pt-2">
                {/* Mobile e Tablets (< 1024px): Slider Interativo "Deslize para doar" */}
                <div className="block lg:hidden">
                  <SlideCommit
                    label={`Deslize para doar R$ ${formattedValorDisplay}`}
                    doneLabel="Gerando Pix..."
                    errorLabel="Não foi possível avançar"
                    onConfirm={handleAvancarParaPagamento}
                    disabled={isGeneratingPix || isOngUser}
                    trackColor="#6B39A7"
                    trackTextColor="#ffffff"
                    handleColor="#ffffff"
                    handleIconColor="#6B39A7"
                    successColor="#16a34a"
                    height={58}
                    radius={20}
                  />
                </div>

                {/* PC e Notebooks (>= 1024px): Botão Tradicional Fintech */}
                <div className="hidden lg:block">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await handleAvancarParaPagamento();
                      } catch {
                        // Mensagem de erro já gerenciada pelo estado errorMessage
                      }
                    }}
                    disabled={isGeneratingPix || isOngUser}
                    className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isGeneratingPix || isOngUser
                        ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
                        : "bg-[#6B39A7] hover:bg-[#582d8c] text-white active:scale-[0.98] shadow-purple-500/25"
                    }`}
                  >
                    {isGeneratingPix ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Gerando QR Code no Banco Central...</span>
                      </>
                    ) : (
                      <span>Continuar para Doação de R$ {formattedValorDisplay}</span>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TELA DE IDENTIFICAÇÃO RÁPIDA (GUEST CHECKOUT - PADRÃO FINTECH ENTERPRISE)
            ========================================================================= */}
        {step === "identification" && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 space-y-6">

              {/* BARRA SUPERIOR DO CARD */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => navigateToStep("amount")}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm sm:text-base font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span>Voltar</span>
                </button>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50/90 border border-purple-200/80 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Total</span>
                  <span className="font-mono font-black text-sm sm:text-base text-[#6B39A7]">
                    R$ {formattedValorDisplay}
                  </span>
                </div>
              </div>

              {/* TÍTULO E SUBTÍTULO COM ALTA LEGIBILIDADE E PEGADA TECH */}
              <div className="text-center space-y-2 pt-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6B39A7] text-white shadow-md shadow-purple-900/20 mb-1">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Identificação para o Pix
                </h2>
                <p className="text-slate-600 text-base sm:text-lg font-medium">
                  Doação para <strong className="text-slate-900 font-bold">{ongData?.name || "a instituição"}</strong>
                  {tipAmount > 0 && (
                    <span className="block text-xs sm:text-sm text-slate-500 mt-1">
                      (Doação: R$ {formattedBaseDisplay} · Apoio DoeCerto: R$ {formattedTipDisplay})
                    </span>
                  )}
                </p>
              </div>

              {/* FORMULÁRIO TECH */}
              <form onSubmit={handleGuestSubmit} className="space-y-5 pt-2">
                {/* 1. NOME COMPLETO */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="ex: Carlos Eduardo Silva"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all text-base sm:text-lg"
                    />
                  </div>
                </div>

                {/* 2. E-MAIL (RECEBER COMPROVANTE) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm sm:text-base font-bold text-slate-800">
                      E-mail
                    </label>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">Para envio do recibo fiscal</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                    <input
                      type="email"
                      value={guestEmailInput}
                      onChange={(e) => setGuestEmailInput(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all text-base sm:text-lg"
                    />
                  </div>
                </div>

                {/* 3. CPF */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm sm:text-base font-bold text-slate-800">
                      CPF
                    </label>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
                      <Lock size={14} className="text-slate-500" /> Exigência do Banco Central
                    </span>
                  </div>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                    <input
                      type="text"
                      value={guestCpf}
                      onChange={(e) => setGuestCpf(formatCPF(e.target.value))}
                      maxLength={14}
                      placeholder="000.000.000-00"
                      className="w-full pl-12 pr-28 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl font-mono text-base sm:text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all"
                    />
                    {guestCpf.length === 14 && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {validateCPF(removeFormatting(guestCpf)) ? (
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            <CheckCircle2 size={16} /> Válido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                            <AlertCircle size={16} /> Inválido
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* BANNER TECH DE DOAÇÃO ANÔNIMA E SEGURA */}
                <div className="flex items-start gap-3.5 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-[#6B39A7] shadow-xs mt-0.5">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">Você está doando de forma anônima e segura</h4>
                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-1">
                      Seus dados são criptografados e exigidos pelo Banco Central para a transação Pix. Seu nome e CPF nunca serão divulgados publicamente no mural da instituição.
                    </p>
                  </div>
                </div>

                {/* ERRO DO FORMULÁRIO SE HOUVER */}
                {guestFormError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm sm:text-base font-medium flex items-center gap-2">
                    <AlertCircle size={20} className="shrink-0 text-rose-600" />
                    <span>{guestFormError}</span>
                  </div>
                )}

                {/* BOTÃO PRINCIPAL (CTA) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGeneratingPix}
                    className="w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all shadow-lg shadow-purple-950/20 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B39A7] to-[#7f3fc9] hover:from-[#582d8c] hover:to-[#6B39A7] text-white active:scale-[0.98] cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingPix ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        <span>Gerando Pix exclusivo no Asaas...</span>
                      </>
                    ) : (
                      <>
                        <span>Gerar Pix de R$ {formattedValorDisplay}</span>
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 2: PAGAMENTO PENDENTE (QR CODE FINTECH + CONCILIAÇÃO AUTOMÁTICA ASAAS)
            ========================================================================= */}
        {step === "payment" && (
          <div className="space-y-6 sm:space-y-8">

            {/* CABEÇALHO FINTECH */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackFromPayment}
                  aria-label="Voltar para seleção de valor"
                  title="Alterar valor da contribuição"
                  className="bg-white p-2.5 rounded-full shadow-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pagamento Pix</h1>
                  <p className="text-slate-600 text-base sm:text-lg font-medium mt-1">
                    Doação #{displayCode} · Destino: <strong className="text-slate-800 font-bold">{ongData?.name || "Instituição"}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider block">Valor</span>
                <span className="text-3xl sm:text-4xl font-black text-[#6B39A7] font-mono">
                  R$ {formattedTotalDisplay}
                </span>
                {tipAmount > 0 && (
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    (Doação: R$ {formattedBaseDisplay} · Apoio: R$ {formattedTipDisplay})
                  </span>
                )}
              </div>
            </div>

            {/* CARD PRINCIPAL DO PAGAMENTO VIA PIX */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">

              {/* STATUS & TEMPORIZADOR REGRESSIVO */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className={isExpired ? "text-slate-400 shrink-0" : "text-amber-600 shrink-0"} />
                  <span className="text-sm sm:text-base text-slate-700 font-medium">
                    {isExpired ? (
                      <span className="text-slate-500 font-medium flex items-center gap-2">
                        <span>Tempo limite de pagamento encerrado</span>
                      </span>
                    ) : (
                      <>
                        O pagamento expira em:{" "}
                        <strong className="text-slate-900 font-bold font-mono text-base sm:text-lg">
                          {formattedCountdown}
                        </strong>
                      </>
                    )}
                  </span>
                </div>
                {isExpired ? (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    00:00 · Expirado
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Aguardando Pagamento
                  </span>
                )}
              </div>

              {/* QR CODE EM MOLDURA FINTECH NÍTIDA */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-xs flex justify-center items-center w-[220px] sm:w-[240px] aspect-square overflow-hidden group">
                  {/* OVERLAY DE EXPIRADO */}
                  {isExpired && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 transition-all duration-300">
                      <div className="relative flex items-center justify-center mb-2.5">
                        <div className="absolute inset-0 rounded-2xl bg-purple-500/25 blur-md" />
                        <div className="relative w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md">
                          <RefreshCw size={22} className={`text-purple-300 ${isGeneratingPix ? "animate-spin" : ""}`} />
                        </div>
                      </div>

                      <span className="text-sm font-bold text-white tracking-wide">
                        QR Code Expirado
                      </span>

                      <button
                        type="button"
                        onClick={handleRegeneratePix}
                        disabled={isGeneratingPix}
                        className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B39A7] to-[#8244cc] hover:from-[#582d8c] hover:to-[#6B39A7] text-white font-bold text-xs shadow-lg shadow-purple-950/50 border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
                      >
                        {isGeneratingPix ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Gerando novo...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={13} />
                            <span>Atualizar QR Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {dynamicPix?.qrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${dynamicPix.qrCodeBase64}`}
                      alt="QR Code Pix Asaas"
                      className="w-full h-full object-contain"
                    />
                  ) : dynamicPix?.copyPaste ? (
                    <QRCodeSVG value={dynamicPix.copyPaste} size={210} className="w-full h-full" level="M" />
                  ) : dynamicPixError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-red-500 gap-2 p-3 text-center">
                      <AlertCircle size={26} className="text-red-500" />
                      <span className="font-semibold text-xs leading-snug">{dynamicPixError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (baseAmount >= 5) generateDynamicPix(baseAmount, tipAmount, isAnonymous);
                        }}
                        className="mt-1 px-3 py-1 bg-purple-100 text-[#6B39A7] rounded-lg font-bold text-xs hover:bg-purple-200 cursor-pointer"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                      <Loader2 className="animate-spin text-purple-600" size={28} />
                      <span className="font-medium">Carregando QR Code...</span>
                    </div>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium mt-3 text-center">
                  {isExpired
                    ? "Código temporário expirado por segurança bancária"
                    : "Aponte a câmera do aplicativo do seu banco para o código"}
                </p>
              </div>

              {/* CHAVE PIX COPIA E COLA (ESTILO TOKEN TÉCNICO FINTECH) */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider">
                    Código Pix Copia e Cola Oficial (Asaas)
                  </label>
                  <span className="text-xs sm:text-sm font-medium">
                    {isExpired ? (
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <Clock size={13} /> Expirado
                      </span>
                    ) : (
                      <span className="text-slate-500">Toque para copiar</span>
                    )}
                  </span>
                </div>

                <div className={`flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between p-3 sm:p-3.5 rounded-xl border-2 gap-2.5 transition-all ${isExpired
                  ? 'border-slate-200 bg-slate-50/70'
                  : copied
                    ? 'border-emerald-500 bg-emerald-50/80'
                    : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                  }`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-0.5">
                    <Key className={`shrink-0 ${isExpired ? "text-slate-400" : copied ? "text-emerald-700" : "text-slate-500"}`} size={20} />
                    {activePixCopiaECola ? (
                      <span className={`font-mono text-base sm:text-lg font-bold truncate ${isExpired ? "text-slate-400 select-none" : copied ? "text-emerald-950" : "text-slate-900"}`}>
                        {activePixCopiaECola}
                      </span>
                    ) : (
                      <span className="font-mono text-sm sm:text-base text-slate-400 italic">
                        Gerando código Pix...
                      </span>
                    )}
                  </div>
                  {isExpired ? (
                    <button
                      onClick={handleRegeneratePix}
                      disabled={isGeneratingPix}
                      type="button"
                      title="Gerar novo código Pix"
                      className="shrink-0 w-full min-[480px]:w-auto px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 bg-[#6B39A7] hover:bg-[#582d8c] text-white shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
                    >
                      {isGeneratingPix ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={18} />
                          <span>Gerar Novo Pix</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={copyKey}
                      disabled={!activePixCopiaECola}
                      type="button"
                      title="Copiar código Pix"
                      className={`shrink-0 w-full min-[480px]:w-auto px-5 py-3 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 ${!activePixCopiaECola
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : copied
                          ? "bg-emerald-600 text-white shadow-xs cursor-pointer"
                          : "bg-[#6B39A7] text-white hover:bg-[#582d8c] shadow-xs active:scale-95 cursor-pointer"
                        }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={20} />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* AUDITORIA OFICIAL ASAAS / BANCO CENTRAL */}
              <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-left">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  <strong className="text-slate-900 font-bold">Cobrança Oficial Asaas:</strong> Esta cobrança Pix dinâmica de R$ {formattedTotalDisplay} foi emitida com liquidação rastreada e compensação automática no Banco Central. 100% da sua doação base de R$ {formattedBaseDisplay} é transferida de forma auditada para a instituição.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL DE SUCESSO DA DOAÇÃO (LOTTIE ANIMATION & RECIBO AUDITADO)
          ========================================================================= */}
      <DonationSuccessModal
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          clearPixSessionData();
          if (ongId) {
            router.push(`/ong-public-profile?id=${ongId}`);
          } else {
            router.push("/home");
          }
        }}
        amount={totalAmount}
        formattedAmount={formattedTotalDisplay}
        baseAmount={baseAmount}
        formattedBaseAmount={formattedBaseDisplay}
        tipAmount={tipAmount}
        formattedTipAmount={formattedTipDisplay}
        ongData={ongData}
        impact={impact}
        primaryCategoryName={primaryCategoryName}
        paymentId={dynamicPix?.paymentId}
        trackingId={dynamicPix?.trackingId}
        donationId={dynamicPix?.donationId}
        guestEmail={guestEmailInput}
        isAuthenticated={isAuthenticated}
        onGoHome={() => {
          clearPixSessionData();
          if (ongId) {
            router.push(`/ong-public-profile?id=${ongId}`);
          } else {
            router.push("/home");
          }
        }}
        onGoRegister={() => {
          clearPixSessionData();
          router.push("/register");
        }}
      />

      {/* MODAL DO TUTORIAL */}
      <DonationTutorialModal
        open={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}

export default function PixPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    }>
      <PixPageContent />
    </Suspense>
  );
}