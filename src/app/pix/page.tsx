"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Building2, IdCard, DollarSign,
  Key, Copy, CheckCircle2, FileText, Image as ImageIcon,
  Paperclip, X, UploadCloud
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { QRCodeSVG } from "qrcode.react";

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

  const [ongData, setOngData] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [valor, setValor] = useState("20");
  const valoresRapidos = ["5", "10", "20", "50", "100"];

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
          console.error("Erro ao buscar banco:", e);
          if (e.response?.status === 401) {
            alert("Sua sessão expirou. Por favor, faça login novamente.");
            router.push("/login");
          }
        }
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, [ongId, router]);

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

  const handleConfirmarDoacao = async () => {
    if (!file || !ongId) {
      alert("Por favor, anexe o comprovante.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ongId", ongId);
      formData.append("donationType", "monetary");
      formData.append("monetaryAmount", valor);
      formData.append("monetaryCurrency", "BRL");
      formData.append("proofFile", file);

      await api("/donations", { method: "POST", body: formData });
      setShowPopup(true);
    } catch (error: any) {
      console.error("Erro ao doar:", error);
      const msg = error.message || "Erro ao processar doação.";
      alert(msg);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        
        {/* CABEÇALHO ALINHADO COM O CONTEÚDO */}
        <div className="flex items-center gap-4 mb-8 lg:mb-10">
          <button 
            onClick={() => router.back()} 
            className="flex-shrink-0 bg-white p-3 rounded-full shadow-sm text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-95 border border-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Doação via Pix</h1>
            <p className="text-slate-500 text-sm mt-0.5">Contribua de forma rápida e segura para quem precisa.</p>
          </div>
        </div>

        {/* GRADE DE LAYOUT: 7 colunas (Esquerda) / 5 colunas (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* ==========================================
              COLUNA DA ESQUERDA (Info & Valores) - Ocupa 7/12
              ========================================== */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Card da ONG */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100/50">
                  <Building2 className="text-purple-600" size={24} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight truncate">{ongData?.name || "Carregando..."}</h2>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                    <IdCard size={15} className="flex-shrink-0 text-slate-400" />
                    <span className="truncate">
                      {ongData?.cnpj || bankData?.cnpj || bankData?.ong?.cnpj || "CNPJ não informado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-6 border-t border-slate-100 pt-5 mt-2">
                {[
                  { label: "Instituição", value: bankData?.bankName },
                  { label: "Agência", value: bankData?.agencyNumber },
                  { label: "Conta", value: bankData?.accountNumber },
                  { label: "Tipo", value: bankData?.accountType }
                ].map((item, idx) => (
                  <div key={idx} className="min-w-0">
                    <p className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider mb-1 truncate">
                      {item.label}
                    </p>
                    <p className="font-medium text-sm truncate text-slate-700">{item.value || "---"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Valor */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-50 p-2.5 rounded-xl border border-green-100/50">
                  <DollarSign className="text-green-600" size={22} />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Qual valor deseja doar?</h3>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {valoresRapidos.map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setValor(v)} 
                    className={`flex-1 min-w-[80px] py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 border-2 ${
                      valor === v 
                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]" 
                        : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
                
              <div className="relative group w-full">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  R$
                </div>
                <input 
                  type="number" 
                  placeholder="Outro valor" 
                  value={valor} 
                  onChange={(e) => setValor(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl py-4.5 pl-14 pr-4 font-bold text-lg text-slate-800 transition-all outline-none placeholder:font-medium placeholder:text-slate-400" 
                />
              </div>
            </div>
          </div>

          {/* ==========================================
              COLUNA DA DIREITA (Pagamento) - Ocupa 5/12
              ========================================== */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col">
              
              <div className="w-full flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg text-slate-800">Pagamento</h3>
                <span className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-purple-100">
                  Pix
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 flex justify-center items-center mx-auto w-full max-w-[260px] aspect-square">
                {pixCopiaECola ? (
                  <QRCodeSVG value={pixCopiaECola} size={100} className="w-full h-full" level="M" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-sm text-slate-400 font-medium text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <Loader2 className="animate-spin text-slate-300 mb-2" size={24} />
                    <span>Aguardando<br/>chave Pix...</span>
                  </div>
                )}
              </div>

              {/* Chave Copia e Cola */}
              <div className="w-full mb-8">
                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${copied ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 min-w-0 pl-3">
                    <Key className={`flex-shrink-0 ${copied ? "text-green-600" : "text-slate-400"}`} size={18} />
                    <span className={`text-sm font-medium truncate ${copied ? "text-green-800" : "text-slate-600"}`}>{pixKeyVisual}</span>
                  </div>
                  <button
                    onClick={copyKey}
                    title="Copiar Pix Copia e Cola"
                    className={`flex-shrink-0 ml-2 p-2.5 rounded-xl transition-all ${copied ? "bg-green-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 active:scale-95"}`}
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-center text-slate-400 mt-2.5 font-medium">
                  {copied ? "Código copiado com sucesso!" : "Copie o código para pagar no app do banco"}
                </p>
              </div>

              {/* Anexar Comprovante */}
              <div className="w-full space-y-3 pt-6 border-t border-slate-100 mt-auto">
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Paperclip size={14} /> Comprovante
                </label>
                
                <div className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center group cursor-pointer ${file ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-purple-300'}`}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {!file ? (
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      <UploadCloud size={22} className="text-slate-400 group-hover:text-purple-500 transition-colors mb-1" />
                      <p className="text-xs font-medium text-slate-600">Buscar arquivos</p>
                      <p className="text-[10px] text-slate-400">PDF, JPG ou PNG</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-green-700 font-medium text-sm relative z-20">
                      <span className="truncate flex items-center gap-2 max-w-[85%]">
                        {file.type === "application/pdf" ? (
                          <FileText className="flex-shrink-0 text-red-500" size={18} />
                        ) : (
                          <ImageIcon className="flex-shrink-0 text-green-600" size={18} />
                        )}
                        <span className="truncate font-semibold text-xs" title={file.name}>{file.name}</span>
                      </span>
                      <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-slate-400 hover:text-red-500 p-1 ml-1 transition-colors bg-white rounded-md shadow-sm border border-slate-200">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmarDoacao}
                  disabled={!file || loading}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all mt-4 ${!file || loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20 active:scale-[0.98]"}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> Processando...
                    </span>
                  ) : (
                    "CONFIRMAR DOAÇÃO"
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE SUCESSO */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 lg:p-10 w-full max-w-[400px] text-center shadow-2xl">
            <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-5 mb-5">
              <CheckCircle2 className="text-green-600" size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Tudo certo!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Sua doação para <span className="font-bold text-slate-700">{ongData?.name || "a ONG"}</span> foi informada com sucesso. Muito obrigado por ajudar!
            </p>
            <button 
              onClick={() => router.push("/home")} 
              className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all active:scale-[0.98]"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
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