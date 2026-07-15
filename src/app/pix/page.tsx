"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Building2, IdCard, DollarSign,
  Key, Copy, CheckCircle2, FileText, Image as ImageIcon,
  Paperclip, X
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { QRCodeSVG } from "qrcode.react";

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
    <div className="min-h-screen bg-[#F8F9FD] text-[#3b1a66] pb-16 font-sans relative">
      
      {/* Header & Botão Voltar */}
      <div className="pt-6 px-6 lg:absolute lg:top-6 lg:left-8 z-10 flex items-center">
        <button onClick={() => router.back()} className="bg-white p-3.5 rounded-full shadow-sm text-slate-700 hover:bg-purple-50 transition-all active:scale-95">
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="w-full flex flex-col items-center pt-8 mb-8">
        <h1 className="text-xl font-black text-purple-600 uppercase tracking-widest">Doação em dinheiro</h1>
        <div className="h-1.5 w-14 bg-purple-600 rounded-full mt-2"></div>
      </div>

      <main className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* COLUNA DA ESQUERDA: Informações e Valor */}
          <div className="flex flex-col gap-6 lg:gap-8">
            
            {/* Card da ONG */}
            <div className="bg-white rounded-3xl p-8 shadow-md shadow-purple-100/40 border border-purple-50">
              <div className="flex items-center gap-5 mb-6">
                <div className="bg-purple-600 p-4 rounded-2xl shadow-sm">
                  <Building2 className="text-white" size={26} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-[#3b1a66] leading-tight truncate">{ongData?.name || "Carregando..."}</h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-1 font-bold">
                    <IdCard size={16} className="flex-shrink-0" />
                    <span className="truncate">
                      {ongData?.cnpj || bankData?.cnpj || bankData?.ong?.cnpj || "CNPJ não informado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-6 border-t border-gray-100 pt-6">
                {[
                  { label: "Instituição", value: bankData?.bankName },
                  { label: "Agência", value: bankData?.agencyNumber },
                  { label: "Conta", value: bankData?.accountNumber },
                  { label: "Tipo", value: bankData?.accountType }
                ].map((item, idx) => (
                  <div key={idx} className="min-w-0">
                    <p className="text-slate-400 uppercase text-xs font-black tracking-widest mb-1 truncate">
                      {item.label}
                    </p>
                    <p className="font-bold text-base truncate text-[#3b1a66]">{item.value || "---"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Valor */}
            <div className="bg-white rounded-3xl p-8 shadow-md shadow-purple-100/40 border border-purple-50 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 p-2.5 rounded-xl"><DollarSign className="text-green-600" size={22} /></div>
                <h3 className="font-black text-xl text-[#3b1a66] uppercase tracking-tight">Valor da Doação</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-2">
                {valoresRapidos.map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setValor(v)} 
                    className={`py-4 rounded-2xl font-black text-base transition-all border-2 ${valor === v ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200" : "bg-gray-50 border-transparent text-gray-500 hover:bg-purple-50"}`}
                  >
                    R$ {v}
                  </button>
                ))}
                <div className="col-span-full relative mt-3">
                  <input 
                    type="number" 
                    placeholder="Outro valor" 
                    value={valor} 
                    onChange={(e) => setValor(e.target.value)} 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-2xl py-4.5 px-14 font-black text-xl text-[#3b1a66] focus:bg-white transition-all outline-none" 
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-purple-400 text-xl">R$</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: QR Code e Comprovante */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-md shadow-purple-100/40 border border-purple-50 flex flex-col items-center justify-center">
              <p className="font-black text-slate-400 mb-5 uppercase text-xs tracking-widest">Escaneie o QR Code</p>

              <div className="bg-white p-5 rounded-2xl border-2 border-purple-100 shadow-sm mb-6">
                {pixCopiaECola ? (
                  <QRCodeSVG value={pixCopiaECola} size={180} level="M" />
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center text-base text-slate-400 font-bold text-center">
                    Aguardando chave Pix...
                  </div>
                )}
              </div>

              <div className="w-full mb-6">
                <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${copied ? 'border-green-500 bg-green-50' : 'border-purple-100 bg-purple-50/20'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Key className={`flex-shrink-0 ${copied ? "text-green-600" : "text-purple-600"}`} size={20} />
                    <span className="text-base font-bold truncate text-[#3b1a66]">{pixKeyVisual}</span>
                  </div>
                  <button
                    onClick={copyKey}
                    title="Copiar Pix Copia e Cola"
                    className={`flex-shrink-0 ml-3 p-3 rounded-xl transition-all ${copied ? "bg-green-600 text-white shadow-sm" : "bg-white text-purple-600 shadow-sm hover:scale-105 active:scale-95"}`}
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-center text-slate-400 mt-2 font-semibold">
                  {copied ? "Código Copia e Cola copiado com sucesso!" : "O botão copia o código Pix Copia e Cola completo"}
                </p>
              </div>

              {/* BLOCO DE COMPROVANTE */}
              <div className="w-full space-y-3 pt-6 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <Paperclip size={14} /> Comprovante do Pix
                </label>
                
                <div className={`relative border-2 border-dashed rounded-2xl p-6 lg:p-8 transition-all text-center ${file ? 'border-green-400 bg-green-50' : 'border-purple-200 bg-purple-50/30 hover:bg-purple-50'}`}>
                  {!file ? (
                    <>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-sm font-bold text-purple-500">Clique para anexar imagem ou PDF</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-green-700 font-bold text-sm lg:text-base">
                      <span className="truncate flex items-center gap-2 max-w-[85%]">
                        {file.type === "application/pdf" ? (
                          <FileText className="flex-shrink-0 text-red-500" size={20} />
                        ) : (
                          <ImageIcon className="flex-shrink-0 text-green-600" size={20} />
                        )}
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </span>
                      <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-1 ml-2 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmarDoacao}
                  disabled={!file || loading}
                  className={`w-full py-4.5 rounded-2xl font-black text-base uppercase tracking-widest transition-all mt-4 ${!file || loading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200 active:scale-95"}`}
                >
                  {loading ? "Processando..." : "Confirmar Doação"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE SUCESSO */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-[#3b1a66]/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 lg:p-10 w-full max-w-[400px] text-center shadow-2xl">
            <div className="inline-flex items-center justify-center bg-green-500 rounded-full p-5 lg:p-6 mb-6 shadow-xl shadow-green-200">
              <CheckCircle2 className="text-white" size={36} />
            </div>
            <h2 className="text-2xl font-black text-[#3b1a66] mb-3">Tudo certo!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
              Sua doação para <span className="font-black text-purple-600">{ongData?.name || "a ONG"}</span> foi informada com sucesso. Muito obrigado por ajudar! 💜
            </p>
            <button 
              onClick={() => router.push("/home")} 
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-purple-700 transition-all text-sm shadow-md active:scale-95"
            >
              Concluir
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
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    }>
      <PixPageContent />
    </Suspense>
  );
}