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
  const hasAuditCompleted = Boolean(liveStatus?.complianceStatus?.lastAuditAt);
  const isInconclusiveOrManual =
    isRestricted ||
    verificationStatus === "rejected" ||
    initialOnboarding?.status === "compliance_inconclusive" ||
    initialOnboarding?.status === "awaiting_admin_review" ||
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <CheckCircle2 size={14} /> Cadastro recebido
        </div>
        <h1 className="text-3xl sm:text-[2.2rem] font-extrabold text-gray-900 leading-tight mb-2">
          {onboardingUrl
            ? "Selfie com Documento"
            : isInconclusiveOrManual
              ? "Análise em Andamento"
              : "Preparando sua Verificação"}
        </h1>
        <p className="text-gray-600 text-base font-medium leading-relaxed">
          {ongName}, confira o andamento da validação cadastral e financeira da sua instituição.
        </p>
      </div>

      {/* ESTADO 1: Aguardando Compliance/Asaas gerar subconta ou onboardingUrl */}
      {!onboardingUrl && !isInconclusiveOrManual && (
        <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-[#6B39A7]">
            <Loader2 size={30} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {hasSubaccount
                ? "Gerando link oficial de biometria no Asaas..."
                : "Validando Compliance em bases públicas..."}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Isso leva apenas alguns segundos. Assim que o link estiver pronto, o QR Code aparecerá
              automaticamente aqui e também será enviado para{" "}
              <strong className="text-gray-800">{email}</strong>.
            </p>
          </div>
          {!tokenExpired && onboardingKycToken && (
            <button
              type="button"
              onClick={() => pollStatus(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-200 text-[#6B39A7] text-sm font-bold hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              Atualizar agora
            </button>
          )}
        </div>
      )}

      {/* ESTADO 2: QR Code & Link Oficial do Asaas pronto */}
      {onboardingUrl && (
        <div className="p-6 rounded-2xl bg-white border-2 border-[#6B39A7]/25 shadow-sm flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#6B39A7] flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Biometria do Presidente (Asaas KYC)
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  Escaneie com o celular ou abra o link oficial abaixo
                </p>
              </div>
            </div>
            {isSelfieSubmitted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                <ShieldCheck size={13} />
                {asaasStatus === "approved" || selfieDocStatusUpper === "APPROVED"
                  ? "Aprovado"
                  : "Enviado"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0">
                <Clock size={13} /> Pendente
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={onboardingUrl} size={184} level="M" includeMargin={false} />
            </div>
            <p className="text-xs text-gray-500 font-medium mt-3 text-center max-w-xs">
              Aponte a câmera do celular do representante legal para enviar a CNH/RG e fazer a selfie em ambiente seguro do Asaas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#6B39A7] hover:bg-[#582c8c] text-white font-bold text-sm shadow-sm transition-all"
            >
              <ExternalLink size={16} />
              Abrir Verificação no Navegador
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition-colors cursor-pointer"
            >
              <Copy size={15} />
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Link também enviado para <strong className="text-gray-700">{email}</strong>
            </span>
            {!tokenExpired && onboardingKycToken && (
              <button
                type="button"
                onClick={() => pollStatus(false)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 font-bold text-[#6B39A7] hover:underline cursor-pointer disabled:opacity-60"
              >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                Verificar status
              </button>
            )}
          </div>
        </div>
      )}

      {/* ESTADO 3: Compliance inconclusivo, restrito ou encaminhado para revisão manual */}
      {isInconclusiveOrManual && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
          <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h3 className="text-sm font-extrabold text-amber-950 mb-1">
              Encaminhado para Revisão do Administrador
            </h3>
            <p className="text-sm text-amber-900/90 leading-relaxed">
              {initialOnboarding?.message ||
                "Seus dados e documentos foram recebidos com segurança. Nossa equipe de Compliance e Administração finalizará a conferência manual antes de liberar a biometria e a exibição pública."}
            </p>
          </div>
        </div>
      )}

      {/* AVISO OBRIGATÓRIO: Gate final do Administrador para aparecer no /home */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#6B39A7] shrink-0 mt-0.5" />
        <div className="text-left">
          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-0.5">
            Última etapa: Aprovação da Curadoria
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            A liberação pública na vitrine (<strong>/home</strong>) sempre passa pela conferência final do Administrador do DoeCerto. Você já pode entrar no painel para personalizar fotos, redes sociais e itens de necessidade enquanto concluímos.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.replace("/login")}
        className="w-full py-4 px-6 bg-[#4A2675] hover:bg-[#3b1a66] text-white rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-all cursor-pointer"
      >
        Ir para Login agora
      </button>
    </div>
  );
}
