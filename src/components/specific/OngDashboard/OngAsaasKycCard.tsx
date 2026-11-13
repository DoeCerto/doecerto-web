"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  OngAsaasKycDocument,
  OngAsaasKycSummary,
  OngsProfileService,
} from "@/services/ongs-profile.service";

interface OngAsaasKycCardProps {
  ong: {
    verificationStatus?: string;
    asaasAccountStatus?: string;
    hasEstatuto?: boolean;
    hasAta?: boolean;
    [key: string]: unknown;
  };
  summary: OngAsaasKycSummary | null;
  loadingSummary: boolean;
  onRefreshSummary: () => Promise<void>;
  onActivateSubaccount?: () => Promise<void>;
  onSummaryUpdated: (nextSummary: OngAsaasKycSummary) => void;
  onCompleteProfile: () => void;
  onOpenLegacyDocsModal: () => void;
}

const MAX_KYC_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_KYC_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DOC_TYPE_LABELS: Record<string, string> = {
  IDENTIFICATION: "Documento de Identificação / Selfie",
  IDENTIFICATION_SELFIE: "Selfie com Documento",
  MINUTES_OF_CONSTITUTION: "Ata de Constituição / Estatuto Social",
  MINUTES_OF_ELECTION: "Ata de Eleição da Diretoria",
  SOCIAL_CONTRACT: "Contrato / Estatuto Social",
  ENTREPRENEUR_REQUIREMENT: "Requerimento / Registro Empresarial",
  POWER_OF_ATTORNEY: "Procuração do Representante",
  CUSTOM: "Documento Complementar",
};

const GATEWAY_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovado",
  AWAITING_APPROVAL: "Em análise",
  PENDING: "Pendente",
  REJECTED: "Recusado",
  NOT_SENT: "Não enviado",
  IGNORED: "Dispensado",
};

function getDocStatusMeta(status: string): {
  label: string;
  badgeClass: string;
} {
  const normalized = status?.toUpperCase();
  if (normalized === "APPROVED") {
    return {
      label: "Aprovado",
      badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }
  if (normalized === "PENDING") {
    return {
      label: "Em análise no Asaas",
      badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }
  if (normalized === "REJECTED") {
    return {
      label: "Recusado — Reenviar",
      badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    };
  }
  if (normalized === "IGNORED") {
    return {
      label: "Dispensado",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }
  return {
    label: "Envio pendente",
    badgeClass: "bg-purple-100 text-[#6B39A7] border-purple-200",
  };
}

function formatGatewaySubStatus(value?: string | null): string {
  if (!value) return "—";
  const key = value.toUpperCase();
  return GATEWAY_STATUS_LABELS[key] || value;
}

function formatExpirationDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Painel de status e homologação KYC da subconta Asaas dentro do dashboard da ONG.
 */
export function OngAsaasKycCard({
  ong,
  summary,
  loadingSummary,
  onRefreshSummary,
  onActivateSubaccount,
  onSummaryUpdated,
  onCompleteProfile,
  onOpenLegacyDocsModal,
}: OngAsaasKycCardProps) {
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [activatingSubaccount, setActivatingSubaccount] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const verificationStatus = summary?.verificationStatus || ong.verificationStatus || "pending";
  const asaasStatus = (summary?.asaasAccountStatus || ong.asaasAccountStatus || "pending").toLowerCase();
  const hasSubaccount = summary?.hasSubaccount ?? Boolean(ong.hasAsaasSubaccount);
  const displayProvisionError = activationError || summary?.provisionError || null;

  const handleActivateSubaccount = async () => {
    setActivationError(null);
    setActivatingSubaccount(true);
    try {
      if (onActivateSubaccount) {
        await onActivateSubaccount();
      } else {
        await onRefreshSummary();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível ativar a subconta financeira no momento.";
      setActivationError(message);
    } finally {
      setActivatingSubaccount(false);
    }
  };

  const handleFileSelected = async (
    doc: OngAsaasKycDocument,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_KYC_MIME_TYPES.has(file.type)) {
      toast.error("Formato não suportado. Envie um arquivo PDF, JPG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_KYC_FILE_BYTES) {
      toast.error("O arquivo deve ter no máximo 10 MB.");
      return;
    }

    try {
      setUploadingDocId(doc.id);
      const res = await OngsProfileService.submitAsaasKycDocument(doc.id, file, doc.type);
      if (res.summary) {
        onSummaryUpdated(res.summary);
      } else {
        await onRefreshSummary();
      }
      toast.success("Documento enviado diretamente para análise do Asaas!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o documento ao Asaas.";
      toast.error(message);
    } finally {
      setUploadingDocId(null);
    }
  };

  if (verificationStatus === "rejected") {
    return null;
  }

  // Estado 1: Ainda aguardando aprovação administrativa do DoeCerto (Trava 1)
  if (verificationStatus !== "verified") {
    return (
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-amber-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Etapa 1 de 2 — Auditoria DoeCerto
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
                Subconta financeira será aberta após aprovação do Compliance
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Assim que nossa equipe concluir a auditoria cadastral da instituição, sua subconta exclusiva no gateway de pagamentos (Asaas) será aberta automaticamente.
              </p>

              {summary && !summary.hasCompleteProfileData && summary.missingFields.length > 0 && (
                <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs sm:text-sm text-purple-950">
                  <p className="font-bold flex items-center gap-1.5 text-[#6B39A7]">
                    <AlertCircle size={15} />
                    Adiante seus dados para abertura instantânea da conta bancária:
                  </p>
                  <p className="mt-1 text-slate-700">
                    Campos pendentes no perfil:{" "}
                    <span className="font-semibold">{summary.missingFields.join(", ")}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            {summary && !summary.hasCompleteProfileData && (
              <button
                type="button"
                onClick={onCompleteProfile}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Completar Endereço e Telefone <ArrowRight size={15} />
              </button>
            )}
            {(!ong.hasEstatuto || !ong.hasAta) && (
              <button
                type="button"
                onClick={onOpenLegacyDocsModal}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <FileText size={15} />
                Anexar Estatuto / Ata
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado 2: Aprovada pelo Admin, mas sem subconta criada ainda (Trava 2 — falta endereço/telefone)
  if (!hasSubaccount) {
    const missingFields = summary?.missingFields ?? [];
    const incomplete = summary ? !summary.hasCompleteProfileData : false;

    return (
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border-2 border-[#6B39A7]/25 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-[#6B39A7] border border-purple-200 shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B39A7] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Etapa 2 de 2 — Abertura Automática da Subconta
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
                {incomplete
                  ? "Falta completar endereço e telefone para criar sua subconta Asaas"
                  : "Sua ONG está pronta para ativar a subconta financeira"}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {incomplete
                  ? "Sua ONG já foi aprovada na auditoria do DoeCerto! Preencha os dados cadastrais obrigatórios em Editar Perfil para criarmos sua subconta financeira no Asaas automaticamente e liberar o envio dos documentos bancários (KYC)."
                  : "Seus dados obrigatórios estão preenchidos. Clique em sincronizar para ativar sua subconta financeira agora."}
              </p>

              {incomplete && missingFields.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {missingFields.map((field) => (
                    <span
                      key={field}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      Pendente: {field}
                    </span>
                  ))}
                </div>
              )}

              {displayProvisionError && (
                <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs sm:text-sm text-amber-950">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-950">
                      Não foi possível ativar a subconta automaticamente
                    </p>
                    <p className="mt-0.5 leading-relaxed text-amber-900">
                      {displayProvisionError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {incomplete ? (
              <button
                type="button"
                onClick={onCompleteProfile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Preencher Endereço e Telefone <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleActivateSubaccount()}
                disabled={loadingSummary || activatingSubaccount}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {loadingSummary || activatingSubaccount ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {activatingSubaccount ? "Ativando..." : "Ativar Subconta Agora"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado 3: Subconta já aprovada para repasses e visível na vitrine
  if (asaasStatus === "approved") {
    return (
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-emerald-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={12} /> Subconta Asaas Aprovada
                </span>
                {summary?.asaasWalletId && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Wallet: {summary.asaasWalletId.slice(0, 8)}...
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
                Homologação bancária concluída e doações habilitadas
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Sua subconta no Asaas está regularizada. Sua instituição está visível na vitrine pública e apta para receber doações e repasses via Pix.
              </p>

              {summary?.gatewayStatus && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    Dados Comerciais: <strong>{formatGatewaySubStatus(summary.gatewayStatus.commercialInfo)}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    Documentação: <strong>{formatGatewaySubStatus(summary.gatewayStatus.documentation)}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    Conta Bancária: <strong>{formatGatewaySubStatus(summary.gatewayStatus.bankAccountInfo)}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onRefreshSummary()}
            disabled={loadingSummary}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loadingSummary ? "animate-spin" : ""} />
            Atualizar Status
          </button>
        </div>
      </div>
    );
  }

  // Estado 4 e 5: Subconta criada, aguardando KYC / selfie / documentos ou com pendência recusada
  const isRejected = asaasStatus === "rejected";
  const documents = summary?.documents ?? [];
  const onboardingExpiration = formatExpirationDate(
    summary?.documents?.find((d) => d.onboardingUrl)?.onboardingUrlExpirationDate,
  );

  return (
    <div
      className={`bg-white rounded-[24px] p-5 sm:p-6 border shadow-sm ${
        isRejected ? "border-rose-300" : "border-amber-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-2xl border shrink-0 ${
              isRejected
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}
          >
            {isRejected ? <ShieldAlert size={22} /> : <Clock size={22} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isRejected
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : "text-amber-700 bg-amber-50 border-amber-200"
                }`}
              >
                {isRejected ? "Homologação Asaas Recusada" : "Homologação Bancária (KYC)"}
              </span>
              {summary?.asaasWalletId && (
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Wallet: {summary.asaasWalletId.slice(0, 8)}...
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
              {isRejected
                ? "O Asaas solicitou ajustes nos documentos da subconta"
                : "Subconta criada — Conclua a validação cadastral (KYC)"}
            </h3>

            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {isRejected
                ? "Confira os motivos apontados abaixo e reenvie os documentos solicitados para liberar os repasses da sua instituição."
                : "Após o envio dos documentos e da selfie do representante legal, o Asaas leva em média de 1 a 2 dias úteis para aprovar a subconta."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onRefreshSummary()}
          disabled={loadingSummary}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loadingSummary ? "animate-spin" : ""} />
          Atualizar Pendências
        </button>
      </div>

      {summary?.rejectReasons && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
          <p className="font-bold text-rose-800 flex items-center gap-1.5">
            <AlertCircle size={16} /> Motivo informado pelo gateway (Asaas):
          </p>
          <p className="mt-1 whitespace-pre-line">{summary.rejectReasons}</p>
        </div>
      )}

      {summary?.pendingInitialization && (
        <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-sky-900">
              Subconta recém-criada em inicialização na Receita Federal / Asaas
            </p>
            <p className="text-xs sm:text-sm text-sky-800 mt-0.5">
              O Asaas leva cerca de 15 segundos a alguns minutos após a criação para liberar a lista de documentos. Clique em atualizar em instantes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onRefreshSummary()}
            disabled={loadingSummary}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-60"
          >
            Verificar Agora
          </button>
        </div>
      )}

      {summary?.onboardingUrl && (
        <div className="mt-4 p-4 rounded-2xl bg-purple-50/90 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#4A1D7A]">
              Validação Facial (Selfie) e Identidade pelo Link Seguro do Asaas
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Para sua segurança, o Asaas exige que a selfie/biometria do representante legal seja feita diretamente na página oficial deles.
              {onboardingExpiration && (
                <span className="block text-[11px] font-semibold text-purple-800 mt-1">
                  Link válido até: {onboardingExpiration}
                </span>
              )}
            </p>
          </div>
          <a
            href={summary.onboardingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6B39A7] hover:bg-[#582d8c] text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0"
          >
            Abrir Selfie / Validação Asaas <ExternalLink size={15} />
          </a>
        </div>
      )}

      {summary?.gatewayStatus && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Status Geral: <strong>{formatGatewaySubStatus(summary.gatewayStatus.general)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Dados Comerciais: <strong>{formatGatewaySubStatus(summary.gatewayStatus.commercialInfo)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Documentação: <strong>{formatGatewaySubStatus(summary.gatewayStatus.documentation)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Conta Bancária: <strong>{formatGatewaySubStatus(summary.gatewayStatus.bankAccountInfo)}</strong>
          </span>
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Checklist de Documentos Solicitados pelo Asaas
          </p>
          {documents.map((doc) => {
            const statusMeta = getDocStatusMeta(doc.status);
            const title = doc.title || DOC_TYPE_LABELS[doc.type] || doc.type;
            const isUploadingThis = uploadingDocId === doc.id;
            const needsAction = doc.status === "NOT_SENT" || doc.status === "REJECTED";

            return (
              <div
                key={doc.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-1">{doc.description}</p>
                  )}
                  {doc.responsible?.name && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Responsável: <span className="font-semibold">{doc.responsible.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.onboardingUrl ? (
                    <a
                      href={doc.onboardingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      Enviar no Asaas <ExternalLink size={14} />
                    </a>
                  ) : doc.canUploadViaApi && needsAction ? (
                    <>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[doc.id] = el;
                        }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => void handleFileSelected(doc, e)}
                      />
                      <button
                        type="button"
                        disabled={Boolean(uploadingDocId)}
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6B39A7] hover:bg-[#582d8c] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isUploadingThis ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {isUploadingThis
                          ? "Enviando..."
                          : doc.status === "REJECTED"
                            ? "Reenviar Arquivo"
                            : "Enviar Arquivo"}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

