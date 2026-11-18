"use client";

import { useState, useEffect } from 'react';
import {
  Check,
  X,
  Eye,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  IdCard,
  CreditCard,
  RefreshCw,
  Clock,
  Copy,
  Search
} from 'lucide-react';
import {
  getOngsByStatus,
  searchOngs,
  approveOng,
  rejectOng,
  syncOngAsaas,
  syncPendingAsaasBatch,
  getOngAsaasKycStatus,
  type OngAsaasKycSummary,
  type OngAdminData,
  type OngStatus
} from '@/services/admin.service';
import toast from 'react-hot-toast';

// --- SUB-COMPONENTE: BADGE DE STATUS ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    verified: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    restricted: 'bg-gray-800 text-white border-gray-900',
  };
  const label = (status === 'approved' || status === 'verified') ? 'Aprovada' : status === 'rejected' ? 'Rejeitada' : status === 'restricted' ? 'Restrita' : 'Pendente';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {label}
    </span>
  );
};

// --- SUB-COMPONENTE: BADGE DE STATUS ASAAS ---
const AsaasBadge = ({
  status,
  walletId,
  hasCompleteProfile,
  verificationStatus,
}: {
  status?: string;
  walletId?: string;
  hasCompleteProfile?: boolean;
  verificationStatus?: string;
}) => {
  if (!walletId || status === 'not_created') {
    if (hasCompleteProfile === false) {
      return (
        <span
          title="Falta endereço completo ou telefone com DDD no perfil da ONG"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Aguardando Perfil
        </span>
      );
    }

    if (hasCompleteProfile && (verificationStatus === 'approved' || verificationStatus === 'verified')) {
      return (
        <span
          title="Perfil completo e ONG aprovada: clique em sincronizar ou aguarde provisionamento"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Pronta p/ Criar Subconta
        </span>
      );
    }

    if (hasCompleteProfile) {
      return (
        <span
          title="Perfil completo: subconta será criada automaticamente ao aprovar"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Pronta após Aprovação
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        Subconta Não Criada
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Asaas: Aprovado
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Asaas: Recusado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      Asaas: Em Análise
    </span>
  );
};

const ApproveModal = ({ isOpen, onClose, onConfirm, ong, status }: any) => {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsConfirming(false);
  }, [isOpen]);

  if (!isOpen) return null;
  const isHighRisk = ong?.riskScore === 0 || ong?.isRestricted;
  const isRestrictedTab = status === 'restricted';

  if (isConfirming) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-50">
            <AlertTriangle size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Tem certeza absoluta?</h3>
          <p className="text-base sm:text-lg text-slate-600 mb-8 font-medium leading-relaxed">
            Você está prestes a aprovar a ONG <strong className="text-slate-900 font-bold">{ong?.name}</strong>. Essa ação a tornará pública e apta a receber doações.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => onConfirm(isRestrictedTab || isHighRisk)} className="w-full text-white py-4 rounded-2xl font-black text-base shadow-lg transition-all bg-green-600 hover:bg-green-700 shadow-green-600/20 active:scale-[0.98]">
              Sim, Confirmar Aprovação
            </button>
            <button onClick={() => setIsConfirming(false)} className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-200 transition-colors">
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-gray-100">
        {isRestrictedTab || isHighRisk ? (
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50">
            <AlertTriangle size={40} strokeWidth={2.5} />
          </div>
        ) : (
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-50">
            <Check size={40} strokeWidth={2.5} />
          </div>
        )}

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {isRestrictedTab || isHighRisk ? 'Remover Restrição?' : 'Aprovar ONG?'}
        </h3>
        <p className="text-base sm:text-lg text-slate-600 mb-6 font-medium leading-relaxed">
          {isRestrictedTab || isHighRisk
            ? <>Deseja remover a restrição e aprovar a ONG <br /><strong className="text-slate-900 font-bold">{ong?.name}</strong> para uso público?</>
            : <>Deseja confirmar a aprovação da ONG <br /><strong className="text-slate-900 font-bold">{ong?.name}</strong>?</>
          }
        </p>

        {(isRestrictedTab || isHighRisk) && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-bold mb-6 text-left leading-relaxed">
            ATENÇÃO: Esta ONG possui um alerta ou restrição de compliance ativa. A aprovação irá remover a restrição e liberar a ONG para a plataforma.
          </div>
        )}

        {/* Informação sobre o Gateway Asaas */}
        {ong?.asaasAccountStatus === 'approved' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs sm:text-sm font-bold mb-6 text-left leading-relaxed flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-emerald-900">Subconta Asaas Aprovada</span>
              A homologação bancária já foi concluída com sucesso. Ao aprovar, a ONG ficará imediatamente apta a receber doações Pix na plataforma.
            </div>
          </div>
        ) : ong?.asaasWalletId ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs sm:text-sm font-bold mb-6 text-left leading-relaxed flex items-start gap-3">
            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-amber-900">Aviso: Subconta Asaas em Homologação</span>
              A subconta Asaas desta ONG já existe e está em análise pelo gateway (prazo de 1 a 2 dias úteis). Ao aprovar o compliance agora, a ONG só aparecerá na vitrine quando o Asaas homologar a subconta.
            </div>
          </div>
        ) : ong?.hasCompleteAsaasProfileData ? (
          <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-2xl text-xs sm:text-sm font-bold mb-6 text-left leading-relaxed flex items-start gap-3">
            <CheckCircle size={20} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-purple-950">Subconta Asaas será criada automaticamente</span>
              A ONG já preencheu endereço e telefone válidos! Ao aprovar agora, o sistema criará a subconta no Asaas imediatamente para iniciar a análise bancária (1 a 2 dias úteis).
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs sm:text-sm font-bold mb-6 text-left leading-relaxed flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-amber-950">Aviso: Perfil Incompleto para Subconta Asaas</span>
              Você já pode aprovar o compliance agora; a subconta será criada automaticamente assim que a ONG preencher:{" "}
              <span className="underline">
                {ong?.missingAsaasProfileFields?.length
                  ? ong.missingAsaasProfileFields.join(', ')
                  : 'endereço completo e telefone com DDD'}
              </span>.
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isRestrictedTab || isHighRisk ? (
            <button onClick={() => setIsConfirming(true)} className="w-full text-white py-4 rounded-2xl font-black text-base shadow-lg transition-all bg-red-600 hover:bg-red-700 shadow-red-600/20 active:scale-[0.98]">
              Aprovar e Liberar Restrição
            </button>
          ) : (
            <button onClick={() => setIsConfirming(true)} className="w-full text-white py-4 rounded-2xl font-black text-base shadow-lg transition-all bg-green-600 hover:bg-green-700 shadow-green-600/20 active:scale-[0.98]">
              Aprovar
            </button>
          )}
          <button onClick={onClose} className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-200 transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: MODAL DE REJEIÇÃO ---
const RejectModal = ({ isOpen, onClose, onConfirm, reason, setReason }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-5 tracking-tight">Motivo da Rejeição</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Descreva o motivo detalhado..."
          className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-red-300 focus:outline-none font-medium text-base text-slate-800 h-36 mb-6 resize-none transition-all"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold text-base hover:bg-slate-200 transition-colors">Cancelar</button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-base hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: MODAL DE DETALHES ---
const DetailsModal = ({ ong, onClose, status, onApproveClick, onRejectClick, onOngUpdated }: any) => {
  const [isSyncingAsaas, setIsSyncingAsaas] = useState(false);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [kycState, setKycState] = useState<{
    ongId: number;
    summary: OngAsaasKycSummary;
  } | null>(null);

  const targetOngId = ong?.id || ong?.userId;
  const kycSummary =
    kycState && targetOngId && kycState.ongId === targetOngId
      ? kycState.summary
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!targetOngId) return;

    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoadingKyc(true);
        return getOngAsaasKycStatus(targetOngId);
      })
      .then((summary) => {
        if (!cancelled) {
          setKycState({ ongId: targetOngId, summary });
        }
      })
      .catch(() => {
        // Falha silenciosa ao abrir; botão manual continua disponível
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingKyc(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetOngId]);

  if (!ong) return null;

  const effectiveWalletId = kycSummary?.asaasWalletId ?? ong.asaasWalletId;
  const effectiveAsaasStatus = (
    kycSummary?.asaasAccountStatus ||
    ong.asaasAccountStatus ||
    'pending'
  ).toLowerCase();
  const hasSubaccount = kycSummary?.hasSubaccount ?? Boolean(effectiveWalletId);
  const effectiveCompleteProfile =
    kycSummary?.hasCompleteProfileData ?? ong.hasCompleteAsaasProfileData;
  const effectiveMissingFields =
    kycSummary?.missingFields ?? ong.missingAsaasProfileFields ?? [];

  const handleSyncAsaas = async () => {
    setIsSyncingAsaas(true);
    try {
      const res = await syncOngAsaas(targetOngId);
      const freshSummary = await getOngAsaasKycStatus(targetOngId).catch(() => null);
      if (freshSummary) {
        setKycState({ ongId: targetOngId, summary: freshSummary });
      }
      if (res && res.asaasWalletId && !res.webhookConfigured) {
        toast.success('Subconta sincronizada (verifique configuração do webhook no ambiente).');
      } else {
        toast.success('Status do Asaas sincronizado!');
      }
      if (onOngUpdated) onOngUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao consultar status no Asaas');
    } finally {
      setIsSyncingAsaas(false);
    }
  };

  const getSanctionDetails = (item: any, source: string) => {
    switch (source) {
      case 'CEPIM':
        return {
          motivo: item.motivo,
          orgao: item.orgaoSuperior?.nome,
          data: item.dataReferencia,
          dataFim: item.dataFimSancao || item.dataFinal || 'Até regularização da pendência',
          processo: item.convenio?.numero
        };
      case 'CNEP':
      case 'CEIS':
        return {
          motivo: item.tipoSancao?.descricaoResumida,
          orgao: item.orgaoSancionador?.nome,
          data: item.dataInicioSancao || item.dataPublicacaoSancao || item.dataReferencia,
          dataFim: item.dataFimSancao && item.dataFimSancao !== 'Sem informação'
            ? item.dataFimSancao
            : (item.dataFimSancao === 'Sem informação' ? 'Sem informação / Indeterminado' : 'Indeterminado'),
          processo: item.numeroProcesso
        };
      case 'CEAF':
        return {
          motivo: item.tipoPunicao?.descricao,
          orgao: item.orgaoLotacao?.nome,
          data: item.punicao?.dataReferencia || item.dataPublicacao,
          dataFim: item.dataFimSancao || 'Penalidade expulsória (permanente)',
          processo: item.punicao?.processo
        };
      default:
        return { motivo: 'Sanção registada', orgao: 'N/A', data: 'N/A', dataFim: 'N/A', processo: 'N/A' };
    }
  };

  const renderAuditResult = (source: string) => {
    const result = ong.auditResults?.find((r: any) => r.source === source);
    if (!result) return <div className="flex items-center gap-2 text-gray-400 font-black text-sm"><CheckCircle size={16} /> Não auditado</div>;

    if (result.hasSanction) {
      const records = Array.isArray(result.rawResponse) ? result.rawResponse : (result.rawResponse ? [result.rawResponse] : []);
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600 font-black text-sm">
            <XCircle size={16} /> Sancionado
          </div>
          {records.map((item: any, idx: number) => {
            const details = getSanctionDetails(item, source);
            return (
              <div key={idx} className="bg-red-50 border border-red-200 text-base p-5 mb-2 rounded-xl flex flex-col gap-2 text-red-900 mt-2">
                <p><strong>Origem:</strong> Portal da Transparência / {source}</p>
                <p><strong>Órgão:</strong> {details.orgao || 'N/A'}</p>
                <p><strong>Processo/Convênio:</strong> {details.processo || 'N/A'}</p>
                <p><strong>Motivo:</strong> {details.motivo || 'N/A'}</p>
                <p><strong>Início da Sanção:</strong> {details.data || 'N/A'}</p>
                <p><strong>Término da Sanção:</strong> {details.dataFim || 'Sem informação'}</p>
              </div>
            );
          })}
        </div>
      );
    }

    if (result.rawResponse?.failed) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
            <AlertTriangle size={16} /> Consulta falhou — status anterior mantido
          </div>
          {result.details && <p className="text-xs text-amber-700">{result.details}</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-green-600 font-black text-sm"><CheckCircle size={16} /> Regular</div>
        {result.details && <p className="text-xs text-gray-500">{result.details}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header fixo do Modal */}
        <div className="flex items-center justify-between px-10 py-7 border-b border-gray-100 shrink-0 bg-white">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Dossiê da ONG</h3>
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-2xl transition-all"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo rolável com barra de rolagem integrada e recuada */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 mr-1.5 custom-scrollbar">
          {/* Header Básico */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={ong.verificationStatus || status} />
              <AsaasBadge status={ong.asaasAccountStatus} walletId={ong.asaasWalletId} />
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-base font-bold">
              {ong.lastAuditAt ? `Última auditoria: ${new Date(ong.lastAuditAt).toLocaleDateString('pt-BR')}` : `Cadastro: ${new Date(ong.createdAt || ong.verifiedAt || Date.now()).toLocaleDateString('pt-BR')}`}
            </div>
          </div>

          {/* Card do Gateway de Pagamento Asaas */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/80 bg-slate-50/70 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Gateway de Pagamento Asaas</h4>
                  <p className="text-xs text-slate-500 font-bold">Marketplace Split Nativo • 100% da doação para a subconta da ONG</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSyncingAsaas}
                  onClick={handleSyncAsaas}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                  title="Consultar status no gateway Asaas em tempo real"
                >
                  <RefreshCw size={14} className={isSyncingAsaas ? "animate-spin" : ""} />
                  {isSyncingAsaas ? "Sincronizando..." : "Sincronizar Status Asaas"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Homologação Bancária</span>
                  {loadingKyc && <span className="text-[11px] font-bold text-slate-400">Consultando gateway...</span>}
                </div>
                {effectiveAsaasStatus === 'approved' && hasSubaccount ? (
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle size={16} className="shrink-0 text-emerald-600" /> Subconta Aprovada e Ativa (Apta a receber doações Pix)
                  </p>
                ) : effectiveAsaasStatus === 'rejected' && hasSubaccount ? (
                  <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                    <XCircle size={16} className="shrink-0 text-red-600" /> Homologação Recusada no Asaas (Aguardando ajustes)
                  </p>
                ) : hasSubaccount ? (
                  <p className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                    <Clock size={16} className="shrink-0 text-amber-600 animate-pulse" /> Em Análise pelo Asaas (Prazo: 1 a 2 dias úteis)
                  </p>
                ) : effectiveCompleteProfile === false ? (
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle size={16} className="shrink-0 text-amber-500" /> Subconta aguardando perfil completo ({effectiveMissingFields.join(', ') || 'endereço/telefone'})
                  </p>
                ) : (
                  <p className="text-sm font-bold text-purple-700 flex items-center gap-1.5">
                    <AlertTriangle size={16} className="shrink-0 text-purple-500" />
                    {status === 'approved'
                      ? 'Perfil completo — clique em "Sincronizar Status Asaas" para criar agora'
                      : 'Perfil completo — subconta será criada automaticamente após aprovação'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Subconta Wallet ID</span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-slate-800 break-all">
                    {effectiveWalletId || 'Não gerado'}
                  </p>
                </div>
                {effectiveWalletId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(effectiveWalletId);
                      toast.success('Wallet ID copiado!');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-2"
                    title="Copiar Wallet ID"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
            </div>

            {kycSummary?.rejectReasons && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900">
                <span className="font-black block text-red-800 mb-1">Motivo da Recusa (Asaas):</span>
                <span className="font-medium whitespace-pre-line">{kycSummary.rejectReasons}</span>
              </div>
            )}

            {kycSummary?.pendingInitialization && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-900 font-semibold">
                Subconta recém-criada: o Asaas ainda está finalizando a validação inicial na Receita Federal (~15s a alguns minutos) antes de listar os documentos KYC.
              </div>
            )}

            {kycSummary?.gatewayStatus && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                  Geral: {kycSummary.gatewayStatus.general}
                </span>
                {kycSummary.gatewayStatus.commercialInfo && (
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                    Comercial: {kycSummary.gatewayStatus.commercialInfo}
                  </span>
                )}
                {kycSummary.gatewayStatus.documentation && (
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                    Docs: {kycSummary.gatewayStatus.documentation}
                  </span>
                )}
                {kycSummary.gatewayStatus.bankAccountInfo && (
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                    Banco: {kycSummary.gatewayStatus.bankAccountInfo}
                  </span>
                )}
              </div>
            )}

            {kycSummary?.onboardingUrl && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-black text-purple-900 uppercase tracking-wider block">
                    Link de Selfie / Onboarding Asaas (p/ ONG)
                  </span>
                  <p className="text-xs font-mono text-purple-800 truncate mt-0.5">{kycSummary.onboardingUrl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(kycSummary.onboardingUrl!);
                      toast.success('Link de validação Asaas copiado!');
                    }}
                    className="px-3 py-2 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy size={13} /> Copiar Link
                  </button>
                  <a
                    href={kycSummary.onboardingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    Abrir <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}

            {kycSummary?.documents && kycSummary.documents.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  Documentos KYC no Gateway ({kycSummary.documents.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kycSummary.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-bold text-slate-800 truncate">
                        {doc.title || doc.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] shrink-0 ${
                          doc.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : doc.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : doc.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dossiê de Integridade & Compliance */}
          <div className="space-y-4">
            <h4 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-2">Integridade & Compliance</h4>

            {/* Header de Risco */}
            {ong.riskScore === 100 && !ong.isRestricted ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl">
                <ShieldCheck size={28} />
                <span className="font-black">Score de Integridade: 100/100 (Regular)</span>
              </div>
            ) : (ong.riskScore != null && (ong.riskScore < 100 || ong.isRestricted)) ? (
              <div className={`flex items-center gap-3 border p-4 rounded-2xl animate-pulse ${ong.isRestricted ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <AlertTriangle size={28} />
                <span className="font-black">
                  Score de Integridade: {ong.riskScore}/100 — {ong.isRestricted ? 'RESTRIÇÃO ATIVA' : status === 'approved' ? 'APROVADA COM EXCEÇÃO' : status === 'rejected' ? 'REJEITADA COM SANÇÕES' : 'ATENÇÃO: SANÇÕES DETETADAS'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 text-gray-500 p-4 rounded-2xl">
                <AlertTriangle size={28} />
                <span className="font-black">Score de Integridade: Pendente (Não auditado)</span>
              </div>
            )}

            {/* Grid de Auditoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50">
                <h5 className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-4">CEIS (Empresas Inidôneas)</h5>
                {renderAuditResult('CEIS')}
              </div>
              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50">
                <h5 className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-4">CEPIM (Impedidas)</h5>
                {renderAuditResult('CEPIM')}
              </div>
              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50">
                <h5 className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-4">CNEP (Empresas Punidas)</h5>
                {renderAuditResult('CNEP')}
              </div>
              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50">
                <h5 className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-4">CEAF (Representante Legal)</h5>
                {renderAuditResult('CEAF')}
              </div>
            </div>
          </div>

          {/* Dados e Representação Legal */}
          <div className="space-y-6">
            <h4 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4">Informações e Representação Legal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">Nome</label><p className="text-lg font-black text-gray-900">{ong.name}</p></section>
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">CNPJ</label><p className="text-lg font-bold text-gray-900">{ong.cnpj}</p></section>
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">E-mail</label><p className="text-lg text-gray-700 font-bold">{ong.email}</p></section>
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">Telefone</label><p className="text-lg text-gray-700 font-bold">{ong.contactNumber || 'Não informado'}</p></section>
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">Presidente</label><p className="text-lg font-black text-gray-900">{ong.presidentName || 'N/A'}</p></section>
              <section><label className="text-sm font-black text-purple-400 uppercase tracking-wider block mb-2">CPF Presidente</label><p className="text-lg font-bold text-gray-900">{ong.presidentCpf || 'N/A'}</p></section>
            </div>

            {/* Documentos */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
              {ong.estatutoUrl ? (
                <a href={ong.estatutoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 flex-1 bg-purple-50 text-purple-600 py-4 rounded-2xl font-black hover:bg-purple-100 transition-all text-base">
                  <FileText size={20} /> Ver Estatuto Social <ExternalLink size={16} />
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-base">
                  <FileText size={20} /> Estatuto não anexado
                </div>
              )}

              {ong.ataUrl ? (
                <a href={ong.ataUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 flex-1 bg-purple-50 text-purple-600 py-4 rounded-2xl font-black hover:bg-purple-100 transition-all text-base">
                  <FileText size={20} /> Ver Ata <ExternalLink size={16} />
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-base">
                  <FileText size={20} /> Ata não anexada
                </div>
              )}

              {ong.cartaoCnpjUrl ? (
                <a href={ong.cartaoCnpjUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 flex-1 bg-purple-50 text-purple-600 py-4 rounded-2xl font-black hover:bg-purple-100 transition-all text-base">
                  <IdCard size={20} /> Ver Cartão CNPJ <ExternalLink size={16} />
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-base">
                  <IdCard size={20} /> Cartão CNPJ não anexado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Fixo com as Ações ou espaçamento de respiro */}
        {(status !== 'approved' || (status === 'approved' && ong.isRestricted) || status !== 'rejected') ? (
          <div className="px-10 py-6 border-t border-gray-100 bg-white shrink-0 flex gap-4">
            {status !== 'approved' && <button onClick={() => onApproveClick(ong)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">Aprovar</button>}
            {status === 'approved' && ong.isRestricted && <button onClick={() => onApproveClick(ong)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">Liberar Restrição</button>}
            {status !== 'rejected' && <button onClick={() => onRejectClick(ong.userId || ong.id)} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Rejeitar</button>}
          </div>
        ) : (
          <div className="h-6 shrink-0 bg-white" />
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function OngTableWithAPI({ status, onClose, onUpdate }: any) {
  const [ongs, setOngs] = useState<OngAdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const [selectedOng, setSelectedOng] = useState<any>(null);
  const [ongToApprove, setOngToApprove] = useState<any>(null);
  const [ongToRejectId, setOngToRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const response = appliedSearch
          ? await searchOngs(appliedSearch, status, skip, itemsPerPage)
          : await getOngsByStatus(status, skip, itemsPerPage);
        if (cancelled) return;

        const nextData = response.data || [];
        const nextTotal = response.total ?? 0;
        if (nextData.length === 0 && currentPage > 1 && nextTotal > 0) {
          setCurrentPage((p) => Math.max(1, p - 1));
          return;
        }
        setOngs(nextData);
        setTotal(nextTotal);
      } catch {
        if (!cancelled) {
          toast.error('Erro ao carregar dados');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, currentPage, appliedSearch, refreshTick]);

  const reloadOngs = () => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setLoading(true);
    setCurrentPage(1);
    setAppliedSearch('');
  };

  const handleConfirmApprove = async (releaseRestriction: boolean = false) => {
    try {
      await approveOng(ongToApprove.id, releaseRestriction);
      toast.success('ONG aprovada!');
      setOngToApprove(null);
      setSelectedOng(null);
      reloadOngs();
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Falha na aprovação');
    }
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejectOng(ongToRejectId!, reason);
      toast.success('ONG rejeitada!');
      setOngToRejectId(null);
      setRejectReason('');
      setSelectedOng(null);
      reloadOngs();
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Falha na rejeição');
    }
  };

  const handleBatchSyncAsaas = async () => {
    if (isBatchSyncing) return;
    setIsBatchSyncing(true);
    try {
      const res = await syncPendingAsaasBatch(50);
      if (res.processed === 0) {
        toast.success('Todas as ONGs aprovadas já estão sincronizadas com subconta ativa!');
      } else {
        const msg = `Lote Asaas: ${res.created} criada(s), ${res.synced} sincronizada(s), ${res.skippedIncomplete} sem perfil completo, ${res.failed} falha(s).`;
        if (res.failed > 0 && res.created === 0 && res.synced === 0) {
          toast.error(msg);
        } else {
          toast.success(msg);
        }
      }
      reloadOngs();
      if (onUpdate) onUpdate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar subcontas Asaas em lote';
      toast.error(msg);
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const config = {
    pending: { title: 'ONGs Pendentes', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    approved: { title: 'ONGs Aprovadas', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    rejected: { title: 'ONGs Recusadas', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    restricted: { title: 'ONGs Restritas', color: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-300' }
  }[status as OngStatus] || { title: 'ONGs', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };

  return (
    <div className="h-full flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
      {/* Header do Card */}
      <div className={`${config.bg} border-b ${config.border} p-6 sm:p-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className={`text-3xl font-black ${config.color} tracking-tight`}>{config.title}</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Total: {total}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(status === 'approved' || status === 'restricted') && (
              <button
                type="button"
                disabled={isBatchSyncing}
                onClick={handleBatchSyncAsaas}
                className="px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                title="Provisiona e sincroniza subcontas Asaas de ONGs aprovadas pendentes (em lote)"
              >
                <RefreshCw size={15} className={isBatchSyncing ? 'animate-spin' : ''} />
                {isBatchSyncing ? 'Sincronizando Lote...' : 'Sincronizar Pendentes em Lote'}
              </button>
            )}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar nome, e-mail ou CNPJ..."
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 w-64"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Buscar
              </button>
              {appliedSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </form>
            {onClose && (
              <button onClick={onClose} className="p-3 hover:bg-white/60 rounded-2xl transition-all"><X size={24} className={config.color} /></button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-[6px] border-purple-100 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : ongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-8">
            <Building2 size={40} className="text-gray-300 mb-3" />
            <p className="text-lg font-bold text-gray-600">Nenhuma ONG encontrada neste filtro.</p>
          </div>
        ) : (
          <table className="w-full">
            {/* CABEÇALHO OPACO: bg-gray-50 sólido e z-index garantido */}
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">Nome</th>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">E-mail</th>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">CNPJ</th>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">Gateway Asaas</th>
                <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ongs.map((ong) => (
                <tr key={ong.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <p className="font-black text-gray-900">{ong.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-600 font-bold">{ong.email}</td>
                  <td className="px-8 py-5 text-sm text-gray-600 font-bold">{ong.cnpj}</td>
                  <td className="px-8 py-5">
                    <AsaasBadge
                      status={ong.asaasAccountStatus}
                      walletId={ong.asaasWalletId}
                      hasCompleteProfile={ong.hasCompleteAsaasProfileData}
                      verificationStatus={ong.status}
                    />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setSelectedOng(ong)} title="Ver Detalhes" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                      {(status !== 'approved' || ong.isRestricted) && <button onClick={() => setOngToApprove(ong)} title={status === 'approved' ? "Liberar Restrição" : "Aprovar"} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><Check size={18} /></button>}
                      {status !== 'rejected' && <button onClick={() => setOngToRejectId(ong.id)} title="Rejeitar" className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><X size={18} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {total > itemsPerPage && (
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Página {currentPage} de {Math.ceil(total / itemsPerPage)}</p>
          <div className="flex gap-2">
            <button onClick={() => { setLoading(true); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-20 hover:bg-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => { setLoading(true); setCurrentPage(p => Math.min(Math.ceil(total / itemsPerPage), p + 1)); }} disabled={currentPage >= total / itemsPerPage} className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-20 hover:bg-white transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {/* Modais */}
      <DetailsModal ong={selectedOng} status={status} onClose={() => setSelectedOng(null)} onApproveClick={(ong: any) => setOngToApprove(ong)} onRejectClick={(id: number) => setOngToRejectId(id)} onOngUpdated={reloadOngs} />
      <ApproveModal isOpen={!!ongToApprove} ong={ongToApprove} status={status} onClose={() => setOngToApprove(null)} onConfirm={handleConfirmApprove} />
      <RejectModal isOpen={!!ongToRejectId} reason={rejectReason} setReason={setRejectReason} onClose={() => { setOngToRejectId(null); setRejectReason(''); }} onConfirm={handleConfirmReject} />
    </div>
  );
}