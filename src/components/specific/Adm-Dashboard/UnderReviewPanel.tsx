"use client";

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminPaginationMeta,
  getUnderReviewDonations,
  resolveUnderReviewDonation,
  UnderReviewDonationItem,
} from '@/services/admin.service';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type UnderReviewPanelProps = {
  onResolved?: () => void;
};

export default function UnderReviewPanel({ onResolved }: UnderReviewPanelProps) {
  const [items, setItems] = useState<UnderReviewDonationItem[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<{
    donation: UnderReviewDonationItem;
    action: 'approve' | 'refund';
  } | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getUnderReviewDonations(meta.page, 15);
        if (!cancelled) {
          setItems(res.data || []);
          setMeta(res.meta || { total: 0, page: meta.page, limit: 15, totalPages: 1 });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Erro ao carregar doações em análise.'
          );
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
  }, [meta.page, refreshTick]);

  const triggerReload = () => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  };

  const handleOpenModal = (
    donation: UnderReviewDonationItem,
    action: 'approve' | 'refund'
  ) => {
    setReason('');
    setModalTarget({ donation, action });
  };

  const handleConfirmResolution = async () => {
    if (!modalTarget) return;
    setSubmitting(true);
    try {
      await resolveUnderReviewDonation(modalTarget.donation.id, {
        action: modalTarget.action,
        reason: reason.trim() || undefined,
      });
      toast.success(
        modalTarget.action === 'approve'
          ? `Doação #${modalTarget.donation.id} aprovada e liberada.`
          : `Estorno solicitado para a doação #${modalTarget.donation.id}.`
      );
      setModalTarget(null);
      setReason('');
      triggerReload();
      onResolved?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Falha ao processar resolução da doação.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 h-full">
      <div className="h-full flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-amber-50/80 border-b border-amber-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Doações em Análise Financeira
              </h2>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-0.5">
                Valores divergentes ou disputas MED retidos preventivamente • {meta.total} pendente(s)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerReload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-amber-800 font-bold text-sm hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[260px]">
              <div className="w-12 h-12 border-[6px] border-amber-100 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center p-8">
              <CheckCircle2 size={44} className="text-green-400 mb-3" />
              <p className="text-lg font-bold text-gray-700">
                Nenhuma doação retida sob análise no momento.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Pagamentos Pix com divergência de valor ou contestação aparecem aqui antes do repasse.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Doação / Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    ONG / Doador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Registrado vs Líquido Gateway
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Motivo da Retenção
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wide">
                    Resolução
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const expectedTotal = item.monetaryAmount + item.tipAmount;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900">#{item.id}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </p>
                        {item.asaasPaymentId && (
                          <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                            {item.asaasPaymentId}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{item.ong.name}</p>
                        <p className="text-xs text-gray-600">
                          Doador: {item.donor.name}
                          {item.donor.email ? ` (${item.donor.email})` : ''}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          Esperado: {BRL.format(expectedTotal)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Líquido Asaas:{' '}
                          {item.asaasNetValue !== null
                            ? BRL.format(item.asaasNetValue)
                            : 'N/D'}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>{item.refundReason || 'Retida sob análise financeira.'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item, 'approve')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item, 'refund')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            <RotateCcw size={14} />
                            Estornar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Página {meta.page} de {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setMeta((p) => ({ ...p, page: Math.max(1, p.page - 1) }));
                }}
                disabled={meta.page <= 1}
                className="p-2.5 rounded-xl border-2 border-gray-200 disabled:opacity-30 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setMeta((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }));
                }}
                disabled={meta.page >= meta.totalPages}
                className="p-2.5 rounded-xl border-2 border-gray-200 disabled:opacity-30 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">
                {modalTarget.action === 'approve'
                  ? `Aprovar Doação #${modalTarget.donation.id}`
                  : `Estornar Doação #${modalTarget.donation.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {modalTarget.action === 'approve'
                ? 'A doação será marcada como concluída e passará a seguir o fluxo normal de retenção D+2 e repasse para a ONG.'
                : 'O sistema solicitará o estorno da cobrança Pix diretamente na subconta Asaas da ONG e notificará as partes.'}
            </p>

            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              {modalTarget.action === 'refund'
                ? 'Justificativa do estorno (registrada em auditoria)'
                : 'Observação da auditoria (opcional)'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva a decisão administrativa..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-sm text-gray-800 mb-5 resize-none"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                disabled={submitting}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={submitting || (modalTarget.action === 'refund' && !reason.trim())}
                className={`flex-1 text-white py-3 rounded-2xl font-black text-sm transition-colors disabled:opacity-50 cursor-pointer ${
                  modalTarget.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting
                  ? 'Processando...'
                  : modalTarget.action === 'approve'
                    ? 'Confirmar Liberação'
                    : 'Confirmar Estorno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
