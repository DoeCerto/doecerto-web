"use client";

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSearch,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminPaginationMeta,
  AuditLogItem,
  getAuditLogs,
} from '@/services/admin.service';

export default function AuditLogsPanel() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAuditLogs({
          page: meta.page,
          limit: 20,
          resource: resourceFilter || undefined,
          action: actionFilter.trim() || undefined,
        });
        if (!cancelled) {
          setItems(res.data || []);
          setMeta(res.meta || { total: 0, page: meta.page, limit: 20, totalPages: 1 });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Erro ao carregar trilha de auditoria.'
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
  }, [meta.page, resourceFilter, actionFilter, refreshTick]);

  return (
    <div className="p-6 sm:p-8 h-full">
      <div className="h-full flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
              <FileSearch size={22} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Logs de Auditoria Imutáveis
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Rastreabilidade administrativa, segurança e repasses • {meta.total} evento(s)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={resourceFilter}
              onChange={(e) => {
                setLoading(true);
                setMeta((p) => ({ ...p, page: 1 }));
                setResourceFilter(e.target.value);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
              aria-label="Filtrar por recurso"
            >
              <option value="">Todos os recursos</option>
              <option value="ongs">ONGs</option>
              <option value="subaccounts">Subcontas</option>
              <option value="transfers">Repasses</option>
              <option value="donations">Doações</option>
              <option value="ong_bank_accounts">Contas Bancárias / Pix</option>
              <option value="auth">Autenticação</option>
              <option value="lgpd">LGPD</option>
              <option value="users">Usuários</option>
            </select>

            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setLoading(true);
                setMeta((p) => ({ ...p, page: 1 }));
                setActionFilter(e.target.value);
              }}
              placeholder="Filtrar ação (ex: ONG_VERIFIED)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-500 w-56"
            />

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshTick((t) => t + 1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[260px]">
              <div className="w-12 h-12 border-[6px] border-slate-100 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center p-8">
              <FileSearch size={40} className="text-gray-300 mb-3" />
              <p className="text-lg font-bold text-gray-600">
                Nenhum evento de auditoria encontrado.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[880px]">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Data / Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Ação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Recurso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                    Responsável / Origem
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wide">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {log.resource}
                      {log.resourceId ? ` #${log.resourceId}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">
                        {log.user?.name || 'SYSTEM / Cron'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {log.user?.email || 'Automação'}
                        {log.ipAddress ? ` • IP ${log.ipAddress}` : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                        Ver Dados
                      </button>
                    </td>
                  </tr>
                ))}
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

      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Evento #{selectedLog.id} — {selectedLog.action}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedLog.resource}
                  {selectedLog.resourceId ? `:${selectedLog.resourceId}` : ''} •{' '}
                  {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {selectedLog.oldValue && (
                <div>
                  <p className="font-black uppercase tracking-wider text-gray-500 mb-1">
                    Valor Anterior (oldValue)
                  </p>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValue && (
                <div>
                  <p className="font-black uppercase tracking-wider text-gray-500 mb-1">
                    Novo Valor (newValue)
                  </p>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.metadata && (
                <div>
                  <p className="font-black uppercase tracking-wider text-gray-500 mb-1">
                    Metadados
                  </p>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {!selectedLog.oldValue && !selectedLog.newValue && !selectedLog.metadata && (
                <p className="text-sm text-gray-500">
                  Este evento não possui payload adicional registrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
