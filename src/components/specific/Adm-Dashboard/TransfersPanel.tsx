"use client";

import { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminPaginationMeta,
  getAdminTransfers,
  TransferAdminItem,
} from '@/services/admin.service';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const STATUS_BADGE: Record<
  TransferAdminItem['status'],
  { label: string; className: string; icon: React.ReactNode }
> = {
  completed: {
    label: 'Concluído',
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle2 size={14} />,
  },
  processing: {
    label: 'Processando',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Loader2 size={14} className="animate-spin" />,
  },
  pending: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock size={14} />,
  },
  failed: {
    label: 'Falhou',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertTriangle size={14} />,
  },
};

export default function TransfersPanel() {
  const [items, setItems] = useState<TransferAdminItem[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminTransfers({
          page: meta.page,
          limit: 15,
          status: statusFilter || undefined,
        });
        if (!cancelled) {
          setItems(res.data || []);
          setMeta(res.meta || { total: 0, page: meta.page, limit: 15, totalPages: 1 });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : 'Erro ao carregar lotes de repasse.'
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
  }, [meta.page, statusFilter, refreshTick]);

  const handleFilterChange = (nextStatus: string) => {
    setLoading(true);
    setMeta((prev) => ({ ...prev, page: 1 }));
    setStatusFilter(nextStatus);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  };

  return (
    <div className="p-6 sm:p-8 h-full">
      <div className="h-full flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-purple-50/70 border-b border-purple-100 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                <ArrowRightLeft size={22} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Repasses Consolidados (Asaas)
                </h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                  Lotes D+2 • Total de registros: {meta.total}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-purple-200 bg-white text-sm font-bold text-gray-700 focus:outline-none focus:border-purple-500"
              aria-label="Filtrar status de repasse"
            >
              <option value="">Todos os status</option>
              <option value="completed">Concluídos</option>
              <option value="processing">Processando</option>
              <option value="pending">Pendentes</option>
              <option value="failed">Falhos</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[260px]">
              <div className="w-12 h-12 border-[6px] border-purple-100 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center p-8">
              <ArrowRightLeft size={40} className="text-gray-300 mb-3" />
              <p className="text-lg font-bold text-gray-600">
                Nenhum lote de repasse encontrado.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Os repasses Pix agendados D+2 aparecerão aqui automaticamente após o processamento diário.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[820px]">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Lote / Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    ONG Beneficiária
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Doações
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Valor Líquido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    ID Gateway Asaas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const badge = STATUS_BADGE[item.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900">#{item.id}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(item.transferredAt || item.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{item.ongName}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {item.ongCnpj || `ONG #${item.ongId}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700">
                          {item.donationsCount} doação(ões)
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">
                        {BRL.format(item.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-600">
                        {item.asaasTransferId || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          {item.errorMessage && (
                            <p className="text-xs text-red-600 max-w-xs break-words">
                              {item.errorMessage}
                            </p>
                          )}
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
    </div>
  );
}
