"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaCopy,
  FaKey,
  FaBuilding,
  FaIdCard,
  FaDollarSign,
  FaCheckCircle,
  FaFilePdf,
  FaFileImage,
} from "react-icons/fa";
import {
  ArrowLeft,
  CircleHelp,
  Eye,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { useState, Suspense, useEffect, useMemo } from "react";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { api } from "@/services/api";
import { QRCodeSVG } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";
import DonationTutorialModal from "@/components/ui/DonationTutorial";
import { ConfirmationCard } from "@/components/ui/ConfirmationCard";
import { SuccessModal } from "@/components/ui/SuccessModal";

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

function getPixKeyType(
  key: string,
): "email" | "cpf" | "cnpj" | "phone" | "random" {
  const cleanKey = key.trim();

  // Email
  if (cleanKey.includes("@")) {
    return "email";
  }

  // UUID aleatório
  const isUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      cleanKey,
    );

  if (isUuid) {
    return "random";
  }

  const digits = cleanKey.replace(/\D/g, "");

  if (digits.length === 14) {
    return "cnpj";
  }

  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    return "phone";
  }

  // CPF → exatamente 11 dígitos
  if (digits.length === 11) {
    return "cpf";
  }

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
  const [showReview, setShowReview] = useState(false);
  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : "";
  }, [file]);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem("hideDonationTutorial");

    if (hidden !== "true") {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!ongId) {
        setInitialLoading(false);
        router.push("/home");
        return;
      }

      const idNum = Number(ongId);

      if (isNaN(idNum)) {
        toast.error("ONG inválida.");
        router.push("/home");
        return;
      }

      try {
        setInitialLoading(true);

        const profile = await OngsProfileService.getPublicProfile(idNum);
        setOngData(profile);

        const response = await api(`/ongs/bank-account/${idNum}`);
        const data = response.data;

        setBankData(Array.isArray(data) ? data[0] : data);
      } catch (error: any) {
        console.error(error);
        toast.error("Não foi possível carregar os dados da ONG.");
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

        if (!rawDigits.startsWith("55")) {
          rawDigits = `55${rawDigits}`;
        }

        treatedKey = `+${rawDigits}`;
        break;

      case "email":
      case "random":
      default:
        treatedKey = baseKey;
        break;
    }

    // Tratamento do Nome
    const nameRaw = ongData?.name || "ONG DOE CERTO";
    const name = nameRaw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .substring(0, 25);

    // Tratamento da Cidade
    const rawCity = ongData?.address?.city || bankData?.city || "ITAPISSUMA";
    const city = rawCity
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .substring(0, 15)
      .toUpperCase();

    const parsedAmount = parseFloat(valor);
    const amountStr =
      isNaN(parsedAmount) || parsedAmount <= 0 ? "" : parsedAmount.toFixed(2);

    try {
      const pfi = "000201";
      const gui = "0014br.gov.bcb.pix";

      const keyTag = `01${treatedKey.length.toString().padStart(2, "0")}${treatedKey}`;
      const merchantAccountContent = gui + keyTag;
      const merchantAccountInfo = `26${merchantAccountContent.length.toString().padStart(2, "0")}${merchantAccountContent}`;

      const mcc = "52040000";
      const currency = "5303986";

      const amountField = amountStr
        ? `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`
        : "";

      const country = "5802BR";
      const merchantNameField = `59${name.length.toString().padStart(2, "0")}${name}`;
      const merchantCityField = `60${city.length.toString().padStart(2, "0")}${city}`;

      const txIdContent = "0503***";
      const additionalDataField = `62${txIdContent.length.toString().padStart(2, "0")}${txIdContent}`;

      const crcIndicator = "6304";

      const partialPayload =
        pfi +
        merchantAccountInfo +
        mcc +
        currency +
        amountField +
        country +
        merchantNameField +
        merchantCityField +
        additionalDataField +
        crcIndicator;

      const crc16 = calculateCRC16(partialPayload);
      return partialPayload + crc16;
    } catch (error) {
      console.error("Erro ao gerar string do Pix:", error);
      return `00020126${(22 + treatedKey.length).toString().padStart(2, "0")}0014br.gov.bcb.pix01${treatedKey.length.toString().padStart(2, "0")}${treatedKey}5204000053039865802BR5913ONG DOE CERTO6010ITAPISSUMA62070503***63040000`;
    }
  }, [
    bankData?.pixKey,
    ongData?.name,
    ongData?.address?.city,
    bankData?.city,
    valor,
  ]);

  const copyKey = async () => {
    try {
      if (!pixCopiaECola) return;

      await navigator.clipboard.writeText(pixCopiaECola);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível copiar o código Pix.");
    }
  };

  const handleConfirmarDoacao = () => {
    if (!file || !ongId) {
      toast.error("Por favor, anexe o comprovante.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 5MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Envie apenas PDF, PNG, JPG ou WEBP.");
      return;
    }

    const donationValue = Number(valor);
    if (isNaN(donationValue) || donationValue <= 0) {
      toast.error("Informe um valor válido para a doação.");
      return;
    }

    setShowReview(true);
  };

  const handleExecuteSubmit = async () => {
    if (!file || !ongId) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("ongId", ongId);
      formData.append("donationType", "monetary");
      formData.append("monetaryCurrency", "BRL");
      formData.append("proofFile", file);
      formData.append("monetaryAmount", Number(valor).toString());

      await api("/donations", {
        method: "POST",
        body: formData,
      });

      setShowReview(false);
      setShowPopup(true);
    } catch (error: any) {
      console.error("Erro ao doar:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Erro ao processar doação.";
      toast.error(msg);
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
    <div className="min-h-screen bg-[#F8F9FD] text-[#3b1a66] pb-12 font-sans relative">
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 999999,
        }}
      />

      <DonationTutorialModal
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <div className="pt-6 px-4 lg:absolute lg:top-8 lg:left-12 z-10">
        <button
          onClick={() => router.back()}
          className="bg-white/90 p-2 rounded-full shadow-md text-gray-900 hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="w-full flex flex-col items-center pt-4 mb-6 lg:mb-10 lg:pt-8">
        <h1 className="text-lg lg:text-xl font-black text-[#4A1D96] uppercase tracking-widest">
          Doação em dinheiro
        </h1>
        <div className="h-1 w-8 bg-purple-600 rounded-full mt-2"></div>
      </div>

      <button
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-purple-600 text-white shadow-xl hover:scale-105 transition"
      >
        <CircleHelp size={24} className="mx-auto" />
      </button>

      <main className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* COLUNA DA ESQUERDA */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-8 shadow-xl shadow-purple-100/50 border border-purple-50">
              <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="bg-purple-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg shadow-purple-200">
                  <FaBuilding className="text-white text-xl lg:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg lg:text-2xl font-black text-[#3b1a66] leading-tight truncate">
                    {ongData?.name || "Carregando..."}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] lg:text-sm mt-1">
                    <FaIdCard className="flex-shrink-0" />
                    <span className="truncate">
                      {ongData?.cnpj ||
                        bankData?.cnpj ||
                        bankData?.ong?.cnpj ||
                        "CNPJ não informado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 lg:gap-y-6 gap-x-4 border-t border-gray-100 pt-6 lg:pt-8">
                {[
                  { label: "Instituição", value: bankData?.bankName },
                  { label: "Agência", value: bankData?.agencyNumber },
                  { label: "Conta", value: bankData?.accountNumber },
                  { label: "Tipo", value: bankData?.accountType },
                ].map((item, idx) => (
                  <div key={idx} className="min-w-0">
                    <p className="text-gray-400 uppercase text-[9px] lg:text-[10px] font-black tracking-widest mb-1 truncate">
                      {item.label}
                    </p>
                    <p className="font-bold text-xs lg:text-sm truncate text-[#3b1a66]">
                      {item.value || "---"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO DE VALOR */}
            <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-purple-100/50 border border-purple-50 flex flex-col">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaDollarSign className="text-green-600" />
                </div>
                <h3 className="font-black text-base lg:text-lg text-[#3b1a66] uppercase tracking-tighter">
                  Valor da Doação
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-6 lg:mb-8">
                {valoresRapidos.map((v) => (
                  <button
                    key={v}
                    onClick={() => setValor(v)}
                    className={`py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm transition-all border-2 ${valor === v ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200" : "bg-gray-50 border-transparent text-gray-500 hover:bg-purple-50"}`}
                  >
                    R$ {v}
                  </button>
                ))}
                <div className="col-span-full relative mt-2">
                  <input
                    type="number"
                    placeholder="Outro"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-xl lg:rounded-2xl py-4 lg:py-6 px-10 lg:px-14 font-black text-lg lg:text-xl focus:bg-white transition-all outline-none"
                  />
                  <span className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 font-black text-purple-300 text-base lg:text-lg">
                    R$
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-purple-100/50 border border-purple-50 flex flex-col items-center justify-center">
              <p className="font-black text-[#3b1a66] mb-4 uppercase text-[10px] lg:text-xs tracking-widest">
                Escaneie o QR Code
              </p>

              <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-purple-100 mb-6">
                {pixCopiaECola ? (
                  <QRCodeSVG value={pixCopiaECola} size={180} level="M" />
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-red-400 font-bold">
                    Aguardando chave Pix...
                  </div>
                )}
              </div>

              <div className="w-full mb-6">
                <div
                  className={`flex items-center justify-between bg-gray-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 ${copied ? "border-green-500 bg-green-50" : "border-transparent"}`}
                >
                  <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                    <FaKey
                      className={`flex-shrink-0 ${copied ? "text-green-600" : "text-purple-600"}`}
                    />
                    <span className="text-[11px] lg:text-sm font-bold truncate tracking-tight">
                      {pixKeyVisual}
                    </span>
                  </div>
                  <button
                    onClick={copyKey}
                    title="Copiar Pix Copia e Cola"
                    className="flex-shrink-0 ml-2 bg-white shadow-md p-2 lg:p-3 rounded-lg lg:rounded-xl hover:scale-110 active:scale-95 transition-all text-purple-600"
                  >
                    {copied ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaCopy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-[15px] text-center text-gray-400 mt-2 font-medium">
                  {copied
                    ? "Código Copia e Cola copiado!"
                    : "O botão copia o código Pix Copia e Cola completo"}
                </p>
              </div>

              {/* BLOCO DE COMPROVANTE */}
              <div className="w-full space-y-4 pt-6 border-t border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  📎 Comprovante do Pix
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl lg:rounded-[1.5rem] p-6 lg:p-8 transition-all text-center ${file ? "border-green-400 bg-green-50" : "border-purple-100 bg-purple-50/30 hover:bg-purple-50"}`}
                >
                  {!file ? (
                    <>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-[11px] lg:text-sm font-bold text-purple-400">
                        Envie o comprovante da transferência para confirmar sua
                        doação
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-green-700 font-bold text-xs lg:text-sm">
                      <span className="truncate flex items-center gap-2 max-w-[85%]">
                        {file.type === "application/pdf" ? (
                          <FaFilePdf className="flex-shrink-0 text-red-500 text-base" />
                        ) : (
                          <FaFileImage className="flex-shrink-0 text-green-600 text-base" />
                        )}
                        <span className="truncate" title={file.name}>
                          {file.name}
                        </span>
                      </span>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 p-1 ml-2 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmarDoacao}
                  disabled={!file || loading}
                  className={`w-full py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm uppercase tracking-[0.2em] transition-all ${!file || loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#00C897] text-white hover:bg-[#00B085] shadow-lg shadow-green-100 active:scale-95"}`}
                >
                  {loading ? "Enviando..." : "Confirmar Doação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {showReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md md:max-w-lg">
            <ConfirmationCard
              type="money"
              title="Confirme os dados da doação"
              description="Confira as informações abaixo antes de confirmar sua doação. Após a confirmação, o comprovante será enviado para análise da ONG."
              amountOrQuantity={`R$ ${Number(valor).toFixed(2)}`}
              detailsLabel="Comprovante da doação"
              detailsContent={
                <button
                  type="button"
                  onClick={() =>
                    window.open(previewUrl, "_blank", "noopener,noreferrer")
                  }
                  className="w-full group rounded-2xl border border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                        <Paperclip size={18} />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-gray-400">
                          Comprovante anexado
                        </p>

                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {file?.name || "comprovante.png"}
                        </p>

                        <p className="text-xs text-purple-600 font-medium mt-1">
                          Clique para visualizar
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                        <Eye size={16} />
                        <span className="text-sm font-semibold">
                          Visualizar
                        </span>
                      </div>

                      <div className="sm:hidden w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                        <Eye size={18} />
                      </div>
                    </div>
                  </div>
                </button>
              }
              primaryButtonText={loading ? "Enviando..." : "Confirmar e Enviar"}
              onPrimaryAction={handleExecuteSubmit}
              secondaryButtonText="Voltar e Alterar"
              onSecondaryAction={() => setShowReview(false)}
            />
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showPopup}
        title="Doação Confirmada!"
        description={`Sua doação de R$ ${Number(valor).toFixed(2)} para ${ongData?.name || "a ONG"} foi registrada com sucesso.`}
        homePath="/home"
        onResetFlow={() => {
          setFile(null);
          setValor("");
          setShowPopup(false);
        }}
      />
    </div>
  );
}

export default function PixPage() {
  return (
    <Suspense fallback={null}>
      <PixPageContent />
    </Suspense>
  );
}
