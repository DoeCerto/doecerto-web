"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, Building2, IdCard, DollarSign,
  Key, Copy, CheckCircle2, FileText, Image as ImageIcon,
  Paperclip, X, UploadCloud, Lock, ShieldCheck, Heart, AlertCircle, AlertTriangle
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import DonationTutorialModal from "@/components/ui/DonationTutorial";
import { GuestEmailModal, readGuestEmail, saveGuestEmail, clearGuestEmail } from "@/components/specific/Donation/GuestEmailModal";
import { calculateImpact } from "@/utils/impactCalculator";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";

// ==========================================
// LÓGICA (Mantida intacta para refatorar depois)
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
// COMPONENTE PRINCIPAL (UX/UI Refatorada)
// ==========================================

function PixPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ongId = searchParams.get("id");

  const { isAuthenticated, userRole } = useAuth();
  const isOngUser = isAuthenticated && userRole === "ong";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Visitante: só o e-mail (definido no modal "Doe sem criar conta"). Sem nome = anônimo.
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
  const [valor, setValor] = useState("20");
  const valoresRapidos = ["5", "10", "20", "50", "100"];

  // Estado para controlar o modal do tutorial na página do Pix
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já marcou para não ver o tutorial novamente (local ou session)
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

  // Calcula o impacto social tangível em tempo real baseado no valor e na Causa Principal da ONG
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

  const copyKey = () => {
    if (!pixCopiaECola) return;
    navigator.clipboard.writeText(pixCopiaECola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGuestEmailSubmit = async (email: string) => {
    saveGuestEmail(email);
    setGuestEmail(email);
    setIsEmailModalOpen(false);
    // Se o visitante já anexou o comprovante, segue direto para a confirmação
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
      setErrorMessage("Você está conectado como uma ONG. Contas de instituições não podem realizar doações. Para doar, desconecte-se ou use uma conta de doador.");
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
        // Visitante: sempre anônimo, e-mail usado só para comprovante/vínculo futuro
        formData.append("isAnonymous", "true");
        formData.append("guestEmail", effectiveGuestEmail);
        formData.append("acceptedTerms", "true");
        setLastGuestEmail(effectiveGuestEmail);
      }

      await api("/donations", { method: "POST", body: formData });
      // Doação concluída: não manter o e-mail no navegador (privacidade / PC compartilhado)
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
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  const pixKeyVisual = bankData?.pixKey || "Chave não configurada";

 return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans overflow-x-hidden">
      
      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-10">
        
        {/* CABEÇALHO COM IDENTIDADE DOECERTO */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <button 
            onClick={() => router.back()} 
            aria-label="Voltar"
            className="flex-shrink-0 bg-white p-2.5 rounded-full shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Doação via Pix</h1>
            <p className="text-slate-600 text-sm sm:text-base font-medium mt-0.5">Contribuição direta e 100% repassada para a instituição.</p>
          </div>
        </div>

        {/* ALERTA DE CONTA DE ONG (NÃO PERMITIDA PARA DOAR) */}
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

        {/* HERO CARD: A INSTITUIÇÃO BENEFICIÁRIA */}
        <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            {/* Avatar Institucional com logo real ou monograma */}
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
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={14} className="text-emerald-600" /> Instituição Verificada
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-md">
                  Conta Oficial
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight truncate tracking-tight">
                {ongData?.name || "Carregando..."}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-base font-medium mt-1">
                <IdCard size={16} className="flex-shrink-0 text-slate-400" />
                <span className="truncate">
                  CNPJ: <strong className="font-mono text-slate-800 font-semibold">{ongData?.cnpj || bankData?.cnpj || bankData?.ong?.cnpj || "Não informado"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Dados bancários oficiais em grid fintech com tipografia legível */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3.5 sm:pt-4">
            {[
              { label: "Banco", value: bankData?.bankName },
              { label: "Agência", value: bankData?.agencyNumber },
              { label: "Conta", value: bankData?.accountNumber },
              { label: "Tipo", value: bankData?.accountType }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/90 border border-slate-200/80 p-2.5 sm:p-3.5 rounded-xl">
                <p className="text-slate-500 uppercase text-xs sm:text-sm font-bold tracking-wider mb-0.5 sm:mb-1 truncate">
                  {item.label}
                </p>
                <p className="font-bold text-sm sm:text-lg truncate text-slate-900 font-mono">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TRILHA DO IMPACTO: STEPPER VERTICAL FINTECH */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 ml-3 sm:ml-6 flex flex-col gap-6 sm:gap-8 pb-4">

          {/* ==========================================
              PASSO 1: VALOR DA CONTRIBUIÇÃO
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 01 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              01
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">
                  Defina o valor da contribuição
                </h3>
                <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                  100% do valor vai direto para a conta oficial da instituição.
                </p>
              </div>

              {/* Botões de valores rápidos adaptáveis a qualquer largura de tela */}
              <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-1.5 sm:gap-2.5 mb-4">
                {valoresRapidos.map((v) => {
                  const isSelected = valor === v;
                  const isSuggested = v === "20";
                  return (
                    <button 
                      key={v} 
                      type="button"
                      onClick={() => setValor(v)} 
                      className={`relative flex-1 min-w-[62px] sm:min-w-0 flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 sm:px-1 rounded-xl text-base sm:text-lg font-bold transition-all duration-150 cursor-pointer ${
                        isSelected 
                          ? "bg-purple-50/80 border-2 border-[#6B39A7] text-[#6B39A7] shadow-xs ring-2 ring-purple-100" 
                          : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                      }`}
                    >
                      <span className="font-mono">R$ {v}</span>
                      {isSuggested && (
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded mt-0.5 ${
                          isSelected ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          Sugerido
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
                
              {/* Campo para outro valor */}
              <div className="relative group w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                  <span className="font-bold text-base sm:text-lg text-slate-400">R$</span>
                </div>
                <input 
                  type="number" 
                  min="1"
                  step="any"
                  placeholder="Ou digite outro valor (ex: 35)" 
                  value={valor} 
                  onChange={(e) => setValor(e.target.value)} 
                  className="w-full bg-slate-50/60 border-2 border-slate-200 focus:bg-white focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 rounded-xl py-3 sm:py-3.5 pl-12 pr-4 font-bold text-base sm:text-lg text-slate-900 transition-all outline-none placeholder:font-medium placeholder:text-slate-400" 
                />
              </div>
            </div>
          </div>

          {/* ==========================================
              PASSO 2: PAGAMENTO VIA PIX
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 02 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              02
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">
                  Pague com a chave ou QR Code
                </h3>
                <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                  Abra o aplicativo do seu banco preferido (Nubank, Itaú, Inter, etc) e escolha pagar via Pix.
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
                      <span className="block text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                        {guestEmail || "Nenhum e-mail informado"}
                      </span>
                    </div>
                  </div>
                  <button
                    id="pix-change-guest-email"
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 min-[440px]:py-1.5 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer text-center w-full min-[440px]:w-auto ml-0 min-[440px]:ml-2"
                  >
                    {guestEmail ? "Alterar e-mail" : "Adicionar e-mail"}
                  </button>
                </div>
              )}

              {/* QR Code com moldura limpa */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-xs flex justify-center items-center max-w-[190px] sm:max-w-[210px] aspect-square w-full">
                  {pixCopiaECola ? (
                    <QRCodeSVG value={pixCopiaECola} size={180} className="w-full h-full" level="M" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-sm sm:text-base text-slate-400 font-medium text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <Loader2 className="animate-spin text-purple-600 mb-2" size={24} />
                      <span>Gerando código Pix...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-base text-slate-600 font-medium mt-3 text-center px-1">
                  Aponte a câmera do aplicativo do seu banco para o código
                </p>
              </div>

              {/* Chave Pix Copia e Cola (Estilo Token Técnico) */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Código Pix Copia e Cola
                  </label>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">
                    Toque para copiar o código
                  </span>
                </div>
                <div className={`flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between p-3 sm:p-3.5 rounded-xl border-2 gap-2.5 transition-all ${
                  copied 
                    ? 'border-emerald-500 bg-emerald-50/80' 
                    : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 focus-within:border-purple-300'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-0.5">
                    <Key className={`flex-shrink-0 ${copied ? "text-emerald-700" : "text-slate-500"}`} size={18} />
                    <span className={`font-mono text-sm sm:text-base font-semibold truncate ${copied ? "text-emerald-950" : "text-slate-900"}`}>
                      {pixKeyVisual}
                    </span>
                  </div>
                  <button
                    onClick={copyKey}
                    type="button"
                    title="Copiar código Pix"
                    className={`shrink-0 w-full min-[480px]:w-auto px-3.5 sm:px-4 py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      copied 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "bg-[#6B39A7] text-white hover:bg-[#582d8c] shadow-xs active:scale-95"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              PASSO 3: COMPROVANTE & CONFIRMAÇÃO
              ========================================== */}
          <div className="relative">
            {/* Marcador Técnico Step 03 */}
            <div className="absolute -left-[27px] sm:-left-[45px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border-2 border-[#6B39A7] text-[#6B39A7] flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shadow-xs ring-4 ring-slate-50">
              03
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-xs border border-slate-200/90">
              <div className="flex items-start sm:items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                    <Paperclip size={20} className="text-[#6B39A7]" /> Anexe o comprovante
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-base font-medium mt-1">
                    Necessário para a ONG identificar e auditar a doação.
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md uppercase tracking-wider shrink-0">
                  Obrigatório
                </span>
              </div>
              
              <div className={`relative border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all text-center group cursor-pointer ${
                file ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-300 bg-slate-50/60 hover:bg-white hover:border-purple-400'
              }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!file ? (
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none py-1 sm:py-2">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#6B39A7] group-hover:scale-105 transition-all shadow-xs">
                      <UploadCloud size={22} />
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-slate-800">
                      Clique para selecionar o comprovante ou arraste aqui
                    </p>
                    <p className="text-xs sm:text-base font-medium text-slate-500">
                      Formatos aceitos: PDF, JPEG ou PNG (até 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-emerald-900 font-medium text-base relative z-20 bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-200 shadow-xs gap-2">
                    <span className="truncate min-w-0 flex-1 flex items-center gap-2">
                      {file.type === "application/pdf" ? (
                        <FileText className="flex-shrink-0 text-red-600" size={20} />
                      ) : (
                        <ImageIcon className="flex-shrink-0 text-emerald-600" size={20} />
                      )}
                      <span className="truncate font-bold text-xs sm:text-base" title={file.name}>
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

              {isAuthenticated && (
                <label className="flex items-center gap-2.5 cursor-pointer pt-4 select-none">
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

              {/* Resumo da Transparência DoeCerto em estilo fintech */}
              <div className="bg-slate-50/90 rounded-xl p-3.5 sm:p-5 my-5 border border-slate-200">
                <div className="flex flex-col min-[440px]:flex-row min-[440px]:justify-between min-[440px]:items-center text-sm sm:text-base font-medium text-slate-600 mb-2.5 gap-1">
                  <span>Destino da doação</span>
                  <span className="font-bold text-slate-900 truncate max-w-full min-[440px]:max-w-[240px]">
                    {ongData?.name || "Instituição"}
                  </span>
                </div>
                <div className="flex flex-col min-[440px]:flex-row min-[440px]:justify-between min-[440px]:items-center text-sm sm:text-base font-medium text-slate-600 mb-3 gap-1">
                  <span>Taxa do DoeCerto</span>
                  <span className="font-bold text-emerald-600 break-words">R$ 0,00 · 100% repassado à instituição</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-slate-900">Total a transferir</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#6B39A7] font-mono">
                    R$ {parseFloat(valor || "0").toFixed(2).replace(".", ",")}
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

              {/* Botão de Confirmação da Doação */}
              <button
                type="button"
                onClick={() => handleConfirmarDoacao()}
                disabled={!file || loading || isOngUser}
                className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all cursor-pointer shadow-sm ${
                  !file || loading || isOngUser
                    ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none" 
                    : "bg-[#6B39A7] hover:bg-[#582d8c] text-white shadow-purple-500/25 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Processando doação...
                  </span>
                ) : (
                  `Confirmar Doação de R$ ${parseFloat(valor || "0").toFixed(2).replace(".", ",")}`
                )}
              </button>

              {!file && (
                <p className="text-sm sm:text-base text-center text-slate-500 font-medium mt-3">
                  Por favor, anexe o comprovante acima para liberar a confirmação.
                </p>
              )}

              {/* Aviso de Segurança e Auditoria Oficial */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex items-start gap-3 text-left">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[15px] sm:text-base text-slate-700 font-medium leading-relaxed">
                  <strong className="text-slate-900 font-bold">Conta Oficial Auditada:</strong> Pagamento processado diretamente no ecossistema Pix do Banco Central do Brasil. O DoeCerto não retém custódia e 100% dos recursos são creditados diretamente na conta oficial da instituição.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE SUCESSO */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">Doação Registrada!</h2>
            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Sua doação para <strong className="text-slate-800 font-bold">{ongData?.name || "a instituição"}</strong> foi enviada para validação. Muito obrigado pelo seu apoio!
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
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                  !isAuthenticated 
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

      {/* MODAL "DOE SEM CRIAR CONTA" (alterar e-mail / acesso direto ao /pix) */}
      <GuestEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleGuestEmailSubmit}
        initialEmail={guestEmail}
        ongName={ongData?.name}
        isLoading={loading}
        submitLabel={file ? "Continuar e confirmar doação" : "Continuar"}
      />

      {/* MODAL DO TUTORIAL NA PÁGINA DE PIX */}
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