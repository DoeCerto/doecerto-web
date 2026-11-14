"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  fetchOnboardingAsaasKycStatus,
  type OnboardingKycStatusResponse,
  type OngOnboardingSummary,
} from "@/services/register-ong.service";

interface OngKycSelfieStepProps {
  ongName: string;
  email: string;
  onboardingKycToken?: string;
  initialOnboarding?: OngOnboardingSummary;
}

export default function OngKycSelfieStep({
  ongName,
  email,
  onboardingKycToken,
  initialOnboarding,
}: OngKycSelfieStepProps) {
  const [liveStatus, setLiveStatus] = useState<OnboardingKycStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  const pollStatus = useCallback(
    async (silent = true) => {
      if (!onboardingKycToken || tokenExpired) return;
      if (!silent) setIsRefreshing(true);
      try {
        const res = await fetchOnboardingAsaasKycStatus(onboardingKycToken);
        setLiveStatus(res);
      } catch (err: unknown) {
        const parsedErr = (err && typeof err === "object" ? err : {}) as {
          status?: number;
          message?: string;
        };
        if (parsedErr.status === 401 || parsedErr.status === 403) {
          setTokenExpired(true);
        } else if (!silent) {
          toast.error(parsedErr.message || "Não foi possível atualizar o status no momento.");
        }
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [onboardingKycToken, tokenExpired],
  );

  const onboardingUrl =
    liveStatus?.onboardingUrl ?? initialOnboarding?.onboardingUrl ?? null;
  const hasSubaccount =
    liveStatus?.hasSubaccount ?? initialOnboarding?.hasSubaccount ?? false;
  const asaasStatus =
    liveStatus?.asaasAccountStatus ?? initialOnboarding?.asaasAccountStatus ?? "pending";
  const verificationStatus = liveStatus?.verificationStatus ?? "pending";
  const isRestricted =
    Boolean(liveStatus?.complianceStatus?.isRestricted) ||
    initialOnboarding?.status === "compliance_restricted";
  const provisionError = liveStatus?.provisionError ?? null;
  const hasAuditCompleted = Boolean(liveStatus?.complianceStatus?.lastAuditAt);
  const isInconclusiveOrManual =
    isRestricted ||
    verificationStatus === "rejected" ||
    initialOnboarding?.status === "compliance_inconclusive" ||
    initialOnboarding?.status === "awaiting_admin_review" ||
    (!hasSubaccount && Boolean(provisionError)) ||
    (hasAuditCompleted && !hasSubaccount);

  const selfieDocGroup = liveStatus?.documents?.find(
    (doc) => Boolean(doc.onboardingUrl) || doc.type?.includes("IDENTIFICATION"),
  );
  const selfieDocStatusUpper = String(selfieDocGroup?.status || "").toUpperCase();
  const isSelfieSubmitted =
    selfieDocStatusUpper === "PENDING" ||
    selfieDocStatusUpper === "APPROVED" ||
    asaasStatus === "approved";

  useEffect(() => {
    if (!onboardingKycToken || tokenExpired || isInconclusiveOrManual || asaasStatus === "approved") {
      return;
    }

    // Busca inicial assíncrona ao abrir a tela se ainda não houver link
    const immediateTimer = !onboardingUrl
      ? setTimeout(() => {
          void pollStatus(true);
        }, 0)
      : null;

    const intervalMs = onboardingUrl ? 6000 : 3500;
    const timer = setInterval(() => {
      void pollStatus(true);
    }, intervalMs);

    return () => {
      if (immediateTimer) clearTimeout(immediateTimer);
      clearInterval(timer);
    };
  }, [
    onboardingKycToken,
    tokenExpired,
    isInconclusiveOrManual,
    asaasStatus,
    onboardingUrl,
    pollStatus,
  ]);

  const handleCopyLink = async () => {
    if (!onboardingUrl) return;
    try {
      await navigator.clipboard.writeText(onboardingUrl);
      setCopied(true);
      toast.success("Link seguro copiado!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o link automaticamente.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm sm:text-base font-bold mb-3.5">
          <CheckCircle2 size={16} /> Pré-cadastro enviado
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-2.5 tracking-tight">
          {onboardingUrl
            ? "Confirme a identidade com uma selfie"
            : isInconclusiveOrManual
              ? "Cadastro em análise manual"
              : "Preparando verificação biométrica"}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
          {ongName}, confira abaixo os últimos passos para liberar repasses financeiros e exibir sua ONG na plataforma.
        </p>
      </div>

      {/* ESTADO 1: Aguardando Compliance/Asaas gerar subconta ou onboardingUrl */}
      {!onboardingUrl && !isInconclusiveOrManual && (
        <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-[#6B39A7]">
            <Loader2 size={30} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
              {hasSubaccount
                ? "Gerando link oficial de biometria..."
                : "Validando dados públicos e regulatórios..."}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
              Isso leva apenas alguns segundos. Assim que estiver pronto, o QR Code aparecerá aqui
              automaticamente e também será enviado para{" "}
              <strong className="text-gray-800">{email}</strong>.
            </p>
          </div>
          {!tokenExpired && onboardingKycToken && (
            <button
              type="button"
              onClick={() => pollStatus(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-purple-200 text-[#6B39A7] text-base font-bold hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              Atualizar agora
            </button>
          )}
        </div>
      )}

      {/* ESTADO 2: QR Code & Link Oficial do Asaas pronto */}
      {onboardingUrl && (
        <div className="p-6 rounded-2xl bg-white border-2 border-[#6B39A7]/25 shadow-sm flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center shrink-0">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Verificação facial do presidente
                </h3>
                <p className="text-sm sm:text-base font-medium text-gray-600 mt-0.5">
                  Escaneie com a câmera do celular ou abra o link oficial abaixo
                </p>
              </div>
            </div>
            {isSelfieSubmitted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold shrink-0">
                <ShieldCheck size={15} />
                {asaasStatus === "approved" || selfieDocStatusUpper === "APPROVED"
                  ? "Aprovado"
                  : "Enviado"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold shrink-0">
                <Clock size={15} /> Pendente
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={onboardingUrl} size={184} level="M" includeMargin={false} />
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-4 text-center max-w-md leading-relaxed">
              O presidente deve fotografar o documento (RG ou CNH) e realizar a selfie no ambiente seguro do nosso parceiro financeiro (Asaas).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[#6B39A7] hover:bg-[#582c8c] text-white font-bold text-base sm:text-lg shadow-sm transition-all"
            >
              <ExternalLink size={18} />
              Abrir verificação agora
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-base sm:text-lg transition-colors cursor-pointer"
            >
              <Copy size={18} />
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-gray-100 text-sm sm:text-base text-gray-600 font-medium">
            <span>
              Link também enviado para <strong className="text-gray-800">{email}</strong>
            </span>
            {!tokenExpired && onboardingKycToken && (
              <button
                type="button"
                onClick={() => pollStatus(false)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 font-bold text-[#6B39A7] hover:underline cursor-pointer disabled:opacity-60"
              >
                <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
                Verificar status
              </button>
            )}
          </div>
        </div>
      )}

      {/* ESTADO 3: Compliance inconclusivo, restrito ou encaminhado para revisão manual */}
      {isInconclusiveOrManual && (
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <ShieldAlert size={24} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-amber-950 mb-1.5">
              {provisionError
                ? "Ativação financeira aguardando ajuste"
                : "Encaminhado para revisão da equipe"}
            </h3>
            <p className="text-base sm:text-lg text-amber-900 font-medium leading-relaxed">
              {provisionError ||
                initialOnboarding?.message ||
                "Seus dados e documentos foram recebidos com segurança. Nossa equipe finalizará a conferência manual antes de liberar a biometria e a exibição pública."}
            </p>
          </div>
        </div>
      )}

      {/* AVISO OBRIGATÓRIO: Gate final do Administrador para aparecer no /home */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
        <ShieldCheck size={24} className="text-[#6B39A7] shrink-0 mt-0.5" />
        <div className="text-left">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
            Última etapa: aprovação da curadoria
          </h3>
          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
            A exibição pública da ONG na plataforma passa pela aprovação final da curadoria do DoeCerto. Enquanto concluímos a revisão, você já pode acessar sua conta para completar fotos, redes sociais e itens necessários.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.replace("/login")}
        className="w-full h-[60px] px-6 bg-[#4A2675] hover:bg-[#3b1a66] text-white rounded-xl font-bold text-lg sm:text-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
      >
        Acessar minha conta
      </button>
    </div>
  );
}
