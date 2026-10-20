"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, Building2, IdCard, DollarSign,
  Key, Copy, CheckCircle2, FileText, Image as ImageIcon,
  Paperclip, X, UploadCloud, Lock, ShieldCheck, Heart, AlertCircle, AlertTriangle,
  Zap, RefreshCw, Clock, Check, HelpCircle
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo, useRef } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import DonationTutorialModal from "@/components/ui/DonationTutorial";
import { GuestEmailModal, readGuestEmail, saveGuestEmail, clearGuestEmail } from "@/components/specific/Donation/GuestEmailModal";
import { calculateImpact } from "@/utils/impactCalculator";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";

// ==========================================
// ÍCONE OFICIAL PIX
// ==========================================
function PixIcon({ className = "w-6 h-6", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path
        d="M414.6 288.5L343.4 217.3c-14.8-14.8-39-14.8-53.8 0L256 250.8l-33.6-33.5c-14.8-14.8-39-14.8-53.8 0L97.4 288.5c-14.8 14.8-14.8 39 0 53.8l71.2 71.2c14.8 14.8 39 14.8 53.8 0l33.6-33.5 33.6 33.5c14.8 14.8 39 14.8 53.8 0l71.2-71.2c14.9-14.8 14.9-39 0-53.8zM256 122.9l33.6 33.5c14.8 14.8 39 14.8 53.8 0l42.4-42.4c14.8-14.8 14.8-39 0-53.8L357 31.4c-14.8-14.8-39-14.8-53.8 0L256 78.6 208.8 31.4c-14.8-14.8-39-14.8-53.8 0L126.2 60.2c-14.8 14.8-14.8 39 0 53.8l42.4 42.4c14.8 14.8 39 14.8 53.8 0L256 122.9z"
        fill="#00B495"
      />
    </svg>
  );
}

// ==========================================
// CÁLCULO DE CRC16 E TRATAMENTO DE CHAVE PIX
// ==========================================

function calculateCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    crc ^= charCode << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function getPixKeyType(key: string): "email" | "cpf" | "cnpj" | "phone" | "random" {
  const cleanKey = key.trim();

  if (cleanKey.includes("@")) return "email";

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanKey);
  if (isUuid) return "random";

  const digits = cleanKey.replace(/\D/g, "");
  if (digits.length === 14) return "cnpj";
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return "phone";
  if (digits.length === 11) return "cpf";

  return "random";
}

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
type FlowStep = "amount" | "payment" | "proof";

interface DynamicPixData {
  donationId: number;
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
    if (urlStep === "pagamento" || urlStep === "payment") return "payment";
    if (urlStep === "comprovante" || urlStep === "proof") return "proof";
    return "amount";
  });

  const { isAuthenticated, userRole, userName } = useAuth();
  const isOngUser = isAuthenticated && userRole === "ong";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [lastGuestEmail, setLastGuestEmail] = useState("");

  useEffect(() => {
    setGuestEmail(readGuestEmail());
  }, []);

  const [ongData, setOngData] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [valor, setValor] = useState(initialValor);
  const valoresRapidos = ["5", "10", "20", "50", "100"];

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

  // Calcula o tempo restante baseado em um timestamp fixo no relógio real (expiresAt do backend ou fallback)
  const calculateRemainingSeconds = (activeValor?: string, pixData?: DynamicPixData | null) => {
    // 1. dynamicPix passado explicitamente ou do estado
    const currentPix = pixData !== undefined ? pixData : dynamicPix;

    // Se temos createdAt oficial, a janela padrão do checkout é estritamente createdAt + 20 minutos
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
        // Se a data for superior a 20 minutos (1200s), é a data bruta de vencimento do Asaas (ex: 1 ano no sandbox)
        // Isso indica cobrança antiga/legado em cache -> tratamos como expirada (0s)
        if (diffSeconds > 1200) {
          return 0;
        }
        return Math.max(0, diffSeconds);
      }
    }

    // 2. Tenta ler do sessionStorage o objeto dynamicPix
    const targetValor = activeValor || valor;
    if (typeof window !== "undefined" && ongId && targetValor) {
      try {
        const cached = sessionStorage.getItem(`dc_dynpix_${ongId}_${targetValor}`);
        if (cached) {
          const parsed = JSON.parse(cached) as DynamicPixData;
          if (parsed?.createdAt) {
            const createdMs = new Date(parsed.createdAt).getTime();
            if (!isNaN(createdMs)) {
              const windowEnd = createdMs + 20 * 60 * 1000;
              return Math.max(0, Math.floor((windowEnd - Date.now()) / 1000));
            }
          }
          if (parsed?.expiresAt) {
            const expMs = new Date(parsed.expiresAt).getTime();
            if (!isNaN(expMs)) {
              const diffSeconds = Math.floor((expMs - Date.now()) / 1000);
              if (diffSeconds > 1200) {
                return 0;
              }
              return Math.max(0, diffSeconds);
            }
          }
        }

        // 3. Fallback para chave de expiração gravada no sessionStorage
        const stored = sessionStorage.getItem(`dc_pix_exp_${ongId}_${targetValor}`);
        if (stored) {
          const expTime = parseInt(stored, 10);
          if (!isNaN(expTime)) {
            const diffSeconds = Math.floor((expTime - Date.now()) / 1000);
            if (diffSeconds > 1200) {
              return 0;
            }
            return Math.max(0, diffSeconds);
          }
        }
      } catch (e) {
        // noop
      }
    }
    return 1199;
  };

  // Timer de expiração ancorado no relógio real (não reinicia no F5)
  const [timeLeft, setTimeLeft] = useState<number>(() => calculateRemainingSeconds(initialValor));
  const isExpired = timeLeft <= 0;

  const parsedAmount = parseFloat(valor);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount >= 5;
  // Doador logado + valor >= 5 = Pix Dinâmico Asaas (100% automático, ZERO comprovante)
  const isDynamicActive = isAuthenticated && userRole === "donor" && isAmountValid;
  const isDynamicReady = isDynamicActive && Boolean(dynamicPix?.copyPaste) && !dynamicPixError;

  const displayCode = useMemo(() => {
    if (dynamicPix?.donationId) return String(dynamicPix.donationId);
    if (ongId) return `${ongId}${String(Date.now()).slice(-4)}`;
    return "1024";
  }, [dynamicPix?.donationId, ongId]);

  const handleExitPix = () => {
    if (ongId) {
      router.replace(`/ong-public-profile?id=${ongId}`);
    } else {
      router.replace("/home");
    }
  };

  const navigateToStep = (newStep: FlowStep, valorOverride?: string) => {
    setStep(newStep);
    setErrorMessage(null);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const activeValor = valorOverride || valor;
      if (activeValor) params.set("valor", activeValor);

      if (newStep === "amount") {
        params.delete("step");
      } else if (newStep === "payment") {
        params.set("step", "pagamento");
      } else if (newStep === "proof") {
        params.set("step", "comprovante");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackFromPayment = () => {
    navigateToStep("amount");
  };

  const handleBackFromProof = () => {
    navigateToStep("payment");
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("step");
      const v = params.get("valor");
      if (v) setValor(v);
      if (s === "pagamento" || s === "payment") {
        setStep("payment");
      } else if (s === "comprovante" || s === "proof") {
        setStep("proof");
      } else {
        setStep("amount");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (step !== "payment") return;

    // Sincroniza imediatamente com o tempo real restante
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

  const generateDynamicPix = async (amount: number, anonymous = isAnonymous) => {
    if (!ongId || isNaN(amount) || amount < 5) return null;
    setIsGeneratingPix(true);
    setDynamicPixError(null);
    try {
      const response = await api<DynamicPixData>("/donations/pix-dinamico", {
        method: "POST",
        body: JSON.stringify({
          ongId: Number(ongId),
          amount,
          isAnonymous: anonymous,
        }),
      });
      const data = response.data;
      setDynamicPix(data);
      lastRequestedAmountRef.current = amount;
      setIsPaymentConfirmed(false);
      setCopied(false);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`dc_dynpix_${ongId}_${amount}`, JSON.stringify(data));
          if (data.expiresAt) {
            const expMs = new Date(data.expiresAt).getTime();
            const diffSeconds = Math.floor((expMs - Date.now()) / 1000);
            const validExpMs = diffSeconds <= 1200 && diffSeconds > 0 ? expMs : (Date.now() + 20 * 60 * 1000);
            sessionStorage.setItem(`dc_pix_exp_${ongId}_${amount}`, String(validExpMs));
            setTimeLeft(Math.max(0, Math.floor((validExpMs - Date.now()) / 1000)));
          } else {
            const fallbackExp = Date.now() + 20 * 60 * 1000;
            sessionStorage.setItem(`dc_pix_exp_${ongId}_${amount}`, String(fallbackExp));
            setTimeLeft(1199);
          }
        } catch (e) {
          // noop
        }
      }
      return data;
    } catch (err: any) {
      console.error("Erro ao gerar Pix Dinâmico:", err);
      const msg = err?.message || "Não foi possível gerar o Pix Dinâmico no momento.";
      setDynamicPixError(msg);
      throw new Error(msg);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleRegeneratePix = async () => {
    const numValor = parseFloat(valor);
    if (isNaN(numValor) || numValor <= 0) return;

    // Limpa cache de sessão para este valor
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`dc_dynpix_${ongId}_${valor}`);
        sessionStorage.removeItem(`dc_pix_exp_${ongId}_${valor}`);
      } catch (e) {
        // noop
      }
    }
    setCopied(false);

    if (isDynamicActive) {
      try {
        await generateDynamicPix(numValor, isAnonymous);
      } catch (err: any) {
        console.error("Erro ao renovar Pix Dinâmico:", err);
      }
    } else {
      const fallbackExp = Date.now() + 20 * 60 * 1000;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`dc_pix_exp_${ongId}_${valor}`, String(fallbackExp));
        } catch (e) {
          // noop
        }
      }
      setTimeLeft(1199);
    }
  };

  const handleAvancarParaPagamento = async () => {
    const numValor = parseFloat(valor);
    if (isNaN(numValor) || numValor <= 0) {
      setErrorMessage("Por favor, selecione ou digite um valor válido para a doação.");
      return;
    }

    if (isOngUser) {
      setErrorMessage("Contas institucionais não podem realizar doações. Para doar, entre com uma conta de doador.");
      return;
    }

    if (isDynamicActive) {
      try {
        const pixData = await generateDynamicPix(numValor, isAnonymous);
        setTimeLeft(calculateRemainingSeconds(valor, pixData));
        navigateToStep("payment", valor);
      } catch (err: any) {
        setErrorMessage(err?.message || "Falha ao gerar o QR Code no Asaas. Tente novamente.");
      }
    } else {
      if (typeof window !== "undefined") {
        try {
          const expTimestamp = Date.now() + 20 * 60 * 1000;
          sessionStorage.setItem(`dc_pix_exp_${ongId}_${valor}`, String(expTimestamp));
        } catch (e) {
          // noop
        }
      }
      setTimeLeft(calculateRemainingSeconds(valor));
      navigateToStep("payment", valor);
    }
  };

  // Garante que se o usuário recarregar (F5) na etapa de pagamento, o QR Code é restaurado do cache ou gerado imediatamente
  useEffect(() => {
    if (step !== "payment" || !isDynamicActive || initialLoading) return;

    const numValor = parseFloat(valor);
    if (isNaN(numValor) || numValor < 5) return;

    // Se já estiver com o dynamicPix carregado para o valor atual, apenas sincroniza
    if (dynamicPix && dynamicPix.amount === numValor && dynamicPix.copyPaste) {
      setTimeLeft(calculateRemainingSeconds(valor, dynamicPix));
      return;
    }

    // 1. Tenta restaurar do cache de sessão
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`dc_dynpix_${ongId}_${numValor}`);
        if (cached) {
          const parsed = JSON.parse(cached) as DynamicPixData;
          if (parsed && parsed.copyPaste && parsed.amount === numValor) {
            setDynamicPix(parsed);
            lastRequestedAmountRef.current = numValor;
            setTimeLeft(calculateRemainingSeconds(valor, parsed));
            return;
          }
        }
      } catch (e) {
        // noop
      }
    }

    // 2. Se não estiver no cache e não estiver gerando, gera automaticamente
    if (!isGeneratingPix) {
      generateDynamicPix(numValor, isAnonymous).catch((err) => {
        console.error("Erro ao gerar Pix ao atualizar a página:", err);
      });
    }
  }, [step, isDynamicActive, dynamicPix, isGeneratingPix, initialLoading, valor, ongId, isAnonymous]);

  useEffect(() => {
    if (!dynamicPix?.donationId || isPaymentConfirmed || step !== "payment" || !isDynamicActive || isExpired) return;

    const interval = setInterval(async () => {
      try {
        const res = await api<{ donationStatus: string }>(`/donations/${dynamicPix.donationId}/status`);
        if (res.data?.donationStatus === "completed") {
          setIsPaymentConfirmed(true);
          setShowPopup(true);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.removeItem(`dc_dynpix_${ongId}_${valor}`);
              sessionStorage.removeItem(`dc_pix_exp_${ongId}_${valor}`);
            } catch (e) {
              // noop
            }
          }
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Erro ao verificar status do Pix:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [dynamicPix?.donationId, isPaymentConfirmed, step, isDynamicActive, ongId, valor, isExpired]);

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

        try {
          const response = await api(`/ongs/bank-account/${idNum}`);
          const data = response.data;
          setBankData(Array.isArray(data) ? data[0] : data);
        } catch (e: any) {
          console.error("Erro ao buscar dados bancários:", e);
        }
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
    const numValor = parseFloat(valor);
    return calculateImpact({
      amount: isNaN(numValor) ? 0 : numValor,
      primaryCategoryName,
      donationType: "monetary",
    });
  }, [valor, primaryCategoryName]);

  const pixCopiaECola = useMemo(() => {
    let baseKey = bankData?.pixKey?.trim();
    if (!baseKey) return "";

    let treatedKey = baseKey;
    const digitsOnly = baseKey.replace(/\D/g, "");
    const keyType = getPixKeyType(baseKey);

    switch (keyType) {
      case "cpf":
      case "cnpj":
        treatedKey = digitsOnly;
        break;
      case "phone":
        let rawDigits = digitsOnly;
        if (!rawDigits.startsWith("55")) rawDigits = `55${rawDigits}`;
        treatedKey = `+${rawDigits}`;
        break;
      case "email":
      case "random":
      default:
        treatedKey = baseKey;
        break;
    }

    const nameRaw = ongData?.name || "ONG DOE CERTO";
    const name = nameRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").trim().substring(0, 25);

    const rawCity = ongData?.address?.city || bankData?.city || "ITAPISSUMA";
    const city = rawCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").trim().substring(0, 15).toUpperCase();

    const parsedAmount = parseFloat(valor);
    const amountStr = isNaN(parsedAmount) || parsedAmount <= 0 ? "" : parsedAmount.toFixed(2);

    try {
      const pfi = "000201";
      const gui = "0014br.gov.bcb.pix";
      const keyTag = `01${treatedKey.length.toString().padStart(2, "0")}${treatedKey}`;
      const merchantAccountContent = gui + keyTag;
      const merchantAccountInfo = `26${merchantAccountContent.length.toString().padStart(2, "0")}${merchantAccountContent}`;
      const mcc = "52040000";
      const currency = "5303986";
      const amountField = amountStr ? `54${amountStr.length.toString().padStart(2, "0")}${amountStr}` : "";
      const country = "5802BR";
      const merchantNameField = `59${name.length.toString().padStart(2, "0")}${name}`;
      const merchantCityField = `60${city.length.toString().padStart(2, "0")}${city}`;
      const txIdContent = "0503***";
      const additionalDataField = `62${txIdContent.length.toString().padStart(2, "0")}${txIdContent}`;
      const crcIndicator = "6304";

      const partialPayload = pfi + merchantAccountInfo + mcc + currency + amountField + country + merchantNameField + merchantCityField + additionalDataField + crcIndicator;
      const crc16 = calculateCRC16(partialPayload);
      return partialPayload + crc16;
    } catch (error) {
      console.error("Erro ao gerar string do Pix:", error);
      return "";
    }
  }, [bankData?.pixKey, ongData?.name, ongData?.address?.city, bankData?.city, valor]);

  const activePixCopiaECola = isDynamicActive
    ? (dynamicPix?.copyPaste || "")
    : (pixCopiaECola || bankData?.pixKey || "");

  const copyKey = () => {
    if (!activePixCopiaECola || isExpired) return;
    navigator.clipboard.writeText(activePixCopiaECola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGuestEmailSubmit = async (email: string) => {
    saveGuestEmail(email);
    setGuestEmail(email);
    setIsEmailModalOpen(false);
    if (file) await handleConfirmarDoacao(email);
  };

  const handleConfirmarDoacao = async (emailOverride?: string) => {
    if (!ongId) return;
    const parsedAmount = parseFloat(valor);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Por favor, selecione ou informe um valor válido para a doação.");
      return;
    }
    if (!file) {
      setErrorMessage("Por favor, anexe o comprovante de pagamento Pix antes de confirmar.");
      return;
    }

    const effectiveGuestEmail = emailOverride || guestEmail;
    if (!isAuthenticated && !effectiveGuestEmail) {
      setIsEmailModalOpen(true);
      return;
    }

    if (isOngUser) {
      setErrorMessage("Você está conectado como uma instituição. Contas de ONG não podem realizar doações.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ongId", ongId);
      formData.append("donationType", "monetary");
      formData.append("monetaryAmount", valor);
      formData.append("monetaryCurrency", "BRL");
      formData.append("proofFile", file);

      if (isAuthenticated) {
        if (isAnonymous) formData.append("isAnonymous", "true");
      } else {
        formData.append("isAnonymous", "true");
        formData.append("guestEmail", effectiveGuestEmail);
        formData.append("acceptedTerms", "true");
        setLastGuestEmail(effectiveGuestEmail);
      }

      await api("/donations", { method: "POST", body: formData });
      clearGuestEmail();
      setGuestEmail("");
      setShowPopup(true);
    } catch (error: any) {
      console.error("Erro ao doar:", error);
      setErrorMessage(error?.message || "Não foi possível processar a doação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  const pixKeyVisual = bankData?.pixKey || "Chave não configurada";
  const formattedValorDisplay = (parseFloat(valor) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
                      Conta Oficial
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight truncate tracking-tight">
                    {ongData?.name || "Carregando..."}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-sm sm:text-base font-medium mt-1.5">
                    <IdCard size={18} className="shrink-0 text-slate-400" />
                    <span>
                      CNPJ: <strong className="font-mono text-slate-800 font-bold text-sm sm:text-base">{ongData?.cnpj || bankData?.cnpj || "Não informado"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* DADOS BANCÁRIOS EM GRID FINTECH */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3.5 sm:pt-4">
                {[
                  { label: "Banco", value: bankData?.bankName },
                  { label: "Agência", value: bankData?.agencyNumber },
                  { label: "Conta", value: bankData?.accountNumber },
                  { label: "Tipo", value: bankData?.accountType }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50/90 border border-slate-200/80 p-2.5 sm:p-3.5 rounded-xl">
                    <p className="text-slate-600 uppercase text-xs sm:text-sm font-bold tracking-wider mb-1 truncate">
                      {item.label}
                    </p>
                    <p className="font-bold text-base sm:text-xl truncate text-slate-900 font-mono">
                      {item.value || "—"}
                    </p>
                  </div>
                ))}
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
                      onClick={() => setValor(v)}
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
                  min="1"
                  step="any"
                  placeholder="Ou digite outro valor (ex: 35)"
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
                  <div className="w-full flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Lock size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                            Identificação Protegida
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded">
                            Anônima
                          </span>
                        </div>
                        <span className="block text-base sm:text-lg font-bold text-slate-900 truncate mt-0.5">
                          {guestEmail || "Nenhum e-mail informado"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="text-sm sm:text-base font-bold text-purple-700 hover:text-purple-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer text-center"
                    >
                      {guestEmail ? "Alterar e-mail" : "Adicionar e-mail"}
                    </button>
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={handleAvancarParaPagamento}
                  disabled={isGeneratingPix || isOngUser}
                  className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${isGeneratingPix || isOngUser
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
                    <span>Gerar QRCode e copia/cola de R$ {formattedValorDisplay}</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TELA 2: PAGAMENTO PENDENTE (QR CODE FINTECH + ZERO COMPROVANTE ASAAS)
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
                  R$ {formattedValorDisplay}
                </span>
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
                      <span className="text-slate-500 font-medium">
                        Tempo limite de pagamento encerrado
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
                  {/* OVERLAY DE EXPIRADO COM ESTILO TECNOLÓGICO MINIMALISTA */}
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

                  {isDynamicActive ? (
                    dynamicPix?.qrCodeBase64 ? (
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
                            const num = parseFloat(valor);
                            if (!isNaN(num) && num >= 5) generateDynamicPix(num, isAnonymous);
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
                    )
                  ) : pixCopiaECola ? (
                    <QRCodeSVG value={pixCopiaECola} size={210} className="w-full h-full" level="M" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                      <Loader2 className="animate-spin text-purple-600" size={28} />
                      <span className="font-medium">Carregando chave da ONG...</span>
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
                    {isDynamicActive ? "Código Pix Copia e Cola Exclusivo (Asaas)" : "Código Pix Copia e Cola"}
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

              {/* SE FOR FLUXO ESTÁTICO (VISITANTE OU < R$ 5): BOTÃO PARA IR AO COMPROVANTE */}
              {!isDynamicActive && (
                <div className="pt-2 space-y-3">
                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 text-sm sm:text-base">
                    <strong>Próximo passo:</strong> Após realizar a transferência no seu banco, avance para anexar o comprovante da transação.
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToStep("proof")}
                    className="w-full py-4 sm:py-5 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-lg sm:text-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Já realizei o pagamento → Anexar Comprovante</span>
                    <ArrowRight size={22} />
                  </button>
                </div>
              )}

              {/* AUDITORIA OFICIAL ASAAS / BANCO CENTRAL */}
              <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-left">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  {isDynamicActive ? (
                    <>
                      <strong className="text-slate-900 font-bold">Cobrança Oficial Asaas:</strong> Esta cobrança Pix dinâmica foi emitida com liquidação rastreada. 100% do repasse líquido é transferido de forma auditada para a instituição.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-900 font-bold">Conta Oficial Auditada:</strong> Pagamento processado diretamente no ecossistema Pix do Banco Central do Brasil.
                    </>
                  )}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 3: ANEXAR COMPROVANTE (APENAS PARA FLUXO ESTÁTICO / MANUAL)
            ========================================================================= */}
        {step === "proof" && !isDynamicActive && (
          <div className="space-y-6 sm:space-y-8">

            {/* CABEÇALHO */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackFromProof}
                aria-label="Voltar para o pagamento"
                title="Voltar para o QR Code"
                className="bg-white p-2.5 rounded-full shadow-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Comprovante Pix</h1>
                <p className="text-slate-600 text-base sm:text-lg font-medium mt-1">
                  Anexe o comprovante para auditoria e validação pela instituição.
                </p>
              </div>
            </div>

            {/* CARD DE UPLOAD DO COMPROVANTE */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">

              <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                    <Paperclip size={22} className="text-[#6B39A7]" /> Anexe o comprovante
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base font-medium mt-1">
                    Necessário para a ONG identificar e auditar a doação de R$ {formattedValorDisplay}.
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md uppercase tracking-wider shrink-0">
                  Obrigatório
                </span>
              </div>

              {/* DROPZONE */}
              <div className={`relative border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all text-center group cursor-pointer ${file ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-300 bg-slate-50/60 hover:bg-white hover:border-purple-400'
                }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!file ? (
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none py-1 sm:py-2">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#6B39A7] group-hover:scale-105 transition-all shadow-xs">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-base sm:text-xl font-bold text-slate-800">
                      Clique para selecionar o comprovante ou arraste aqui
                    </p>
                    <p className="text-sm sm:text-base font-medium text-slate-500">
                      Formatos aceitos: PDF, JPEG ou PNG (até 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-emerald-900 font-medium text-base relative z-20 bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-200 shadow-xs gap-2">
                    <span className="truncate min-w-0 flex-1 flex items-center gap-2">
                      {file.type === "application/pdf" ? (
                        <FileText className="shrink-0 text-red-600" size={20} />
                      ) : (
                        <ImageIcon className="shrink-0 text-emerald-600" size={20} />
                      )}
                      <span className="truncate font-bold text-sm sm:text-base" title={file.name}>
                        {file.name}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="text-slate-400 hover:text-red-600 p-1.5 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
                      title="Remover"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
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

              {/* BOTÃO DE CONFIRMAR DOAÇÃO */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmarDoacao()}
                  disabled={!file || loading || isOngUser}
                  className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all cursor-pointer shadow-sm ${!file || loading || isOngUser
                    ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#6B39A7] hover:bg-[#582d8c] text-white shadow-purple-500/25 active:scale-[0.98]"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Processando doação...
                    </span>
                  ) : (
                    `Confirmar Doação de R$ ${formattedValorDisplay}`
                  )}
                </button>
                {!file && (
                  <p className="text-base sm:text-lg text-center text-slate-600 font-medium mt-3">
                    Por favor, anexe o comprovante acima para liberar a confirmação.
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL DE SUCESSO (COMEMORAÇÃO E IMPACTO CONCRETIZADO)
          ========================================================================= */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              {isPaymentConfirmed ? "Doação Confirmada!" : "Doação Registrada!"}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              {isPaymentConfirmed ? (
                <>
                  Seu Pix de <strong className="text-purple-700 font-bold">R$ {formattedValorDisplay}</strong> foi compensado instantaneamente no Banco Central e destinado à instituição <strong className="text-slate-800 font-bold">{ongData?.name || "beneficiária"}</strong>. Muito obrigado pelo seu apoio!
                </>
              ) : (
                <>
                  Sua doação para <strong className="text-slate-800 font-bold">{ongData?.name || "a instituição"}</strong> foi enviada para validação. Muito obrigado pelo seu apoio!
                </>
              )}
            </p>

            {/* Destaque do Impacto Gerado */}
            {impact && impact.units > 0 && (
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-left mb-6 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-100/70 border border-purple-200/60 flex items-center justify-center text-purple-700 shrink-0 shadow-2xs mt-0.5">
                  <CategoryImpactIcon category={primaryCategoryName} size={22} className="text-purple-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Impacto Social Concretizado
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {impact.impactText}
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
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all cursor-pointer ${!isAuthenticated
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  : "bg-[#6B39A7] hover:bg-[#5b2f8e] text-white shadow-sm active:scale-[0.98]"
                  }`}
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL "DOE SEM CRIAR CONTA" */}
      <GuestEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleGuestEmailSubmit}
        initialEmail={guestEmail}
        ongName={ongData?.name}
        isLoading={loading}
        submitLabel={file ? "Continuar e confirmar doação" : "Continuar"}
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