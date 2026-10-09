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
  IdCard
} from 'lucide-react';
import {
  getOngsByStatus,
  approveOng,
  rejectOng,
  type OngAdminData
} from '@/services/admin.service';
import toast from 'react-hot-toast';

type OngStatus = 'pending' | 'approved' | 'rejected';

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

const ApproveModal = ({ isOpen, onClose, onConfirm, ong, status }: any) => {
  if (!isOpen) return null;
  const isHighRisk = ong?.riskScore === 0 || ong?.isRestricted;
  const isRestrictedTab = status === 'restricted';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
        {isRestrictedTab || isHighRisk ? (
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} strokeWidth={3} />
          </div>
        ) : (
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} strokeWidth={3} />
          </div>
        )}

        <h3 className="text-2xl font-black text-gray-900 mb-2">
          {isRestrictedTab || isHighRisk ? 'Remover Restrição?' : 'Aprovar ONG?'}
        </h3>
        <p className="text-gray-500 mb-6">
          {isRestrictedTab || isHighRisk
            ? <>Deseja remover a restrição e aprovar a ONG <br /><span className="font-bold text-gray-900">{ong?.name}</span> para uso público?</>
            : <>Deseja confirmar a aprovação da ONG <br /><span className="font-bold text-gray-900">{ong?.name}</span>?</>
          }
        </p>

        {(isRestrictedTab || isHighRisk) && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold mb-6 text-left">
            ATENÇÃO: Esta ONG possui um alerta ou restrição de compliance ativa. A aprovação irá remover a restrição e liberar a ONG para a plataforma.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isRestrictedTab || isHighRisk ? (
            <button onClick={() => onConfirm(true)} className="w-full text-white py-3 rounded-2xl font-black shadow-lg transition-colors bg-red-600 hover:bg-red-700 shadow-red-200">
              Aprovar e Liberar Restrição
            </button>
          ) : (
            <button onClick={() => onConfirm(false)} className="w-full text-white py-3 rounded-2xl font-black shadow-lg transition-colors bg-green-600 hover:bg-green-700 shadow-green-200">
              Aprovar
            </button>
          )}
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-black hover:bg-gray-200 transition-colors mt-2">Cancelar</button>
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
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <h3 className="text-2xl font-black text-gray-900 mb-6">Motivo da Rejeição</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Descreva o motivo..."
          className="w-full px-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-red-200 focus:outline-none h-32 mb-6 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-black hover:bg-gray-200">Cancelar</button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200 transition-all"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: MODAL DE DETALHES ---
const DetailsModal = ({ ong, onClose, status, onApproveClick, onRejectClick }: any) => {
  if (!ong) return null;
  console.log('[DEBUG] ONG no Modal de Detalhes:', ong);

  const getSanctionDetails = (item: any, source: string) => {
    switch (source) {
      case 'CEPIM':
        return {
          motivo: item.motivo,
          orgao: item.orgaoSuperior?.nome,
          data: item.dataReferencia,
          processo: item.convenio?.numero
        };
      case 'CNEP':
      case 'CEIS':
        return {
          motivo: item.tipoSancao?.descricaoResumida,
          orgao: item.orgaoSancionador?.nome,
          data: item.dataInicioSancao || item.dataReferencia,
          processo: item.numeroProcesso
        };
      case 'CEAF':
        return {
          motivo: item.tipoPunicao?.descricao,
          orgao: item.orgaoLotacao?.nome,
          data: item.punicao?.dataReferencia || item.dataPublicacao,
          processo: item.punicao?.processo
        };
      default:
        return { motivo: 'Sanção registada', orgao: 'N/A', data: 'N/A', processo: 'N/A' };
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
                <p><strong>Data:</strong> {details.data || 'N/A'}</p>
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
      <div className="bg-white rounded-[2.5rem] max-w-5xl w-full p-12 max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100">

        <div className="flex items-center justify-between mb-10">
          <h3 className="text-4xl font-black text-gray-900">Dossiê da ONG</h3>
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"><X size={28} /></button>
        </div>

        <div className="space-y-10">
          {/* Header Básico */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <StatusBadge status={ong.verificationStatus || status} />
            <div className="flex items-center gap-2 text-gray-500 text-base font-bold">
              {ong.lastAuditAt ? `Última auditoria: ${new Date(ong.lastAuditAt).toLocaleDateString('pt-BR')}` : `Cadastro: ${new Date(ong.createdAt || ong.verifiedAt || Date.now()).toLocaleDateString('pt-BR')}`}
            </div>
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

          {/* Ações */}
          <div className="flex gap-4 pt-8 border-t border-gray-100">
            {status !== 'approved' && <button onClick={() => onApproveClick(ong)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">Aprovar</button>}
            {status === 'approved' && ong.isRestricted && <button onClick={() => onApproveClick(ong)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">Liberar Restrição</button>}
            {status !== 'rejected' && <button onClick={() => onRejectClick(ong.userId || ong.id)} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Rejeitar</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function OngTableWithAPI({ status, onClose, onUpdate }: any) {
  const [ongs, setOngs] = useState<OngAdminData[]>([]);
  const [allOngs, setAllOngs] = useState<OngAdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedOng, setSelectedOng] = useState<any>(null);
  const [ongToApprove, setOngToApprove] = useState<any>(null);
  const [ongToRejectId, setOngToRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const itemsPerPage = 10;

  useEffect(() => { loadOngs(); }, [status]);

  useEffect(() => {
    if (allOngs.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      setOngs(allOngs.slice(startIndex, startIndex + itemsPerPage));
    }
  }, [currentPage, allOngs]);

  const loadOngs = async () => {
    setLoading(true);
    try {
      const response = await getOngsByStatus(status, 0, 1000);
      const data = response.data || [];
      setAllOngs(data);
      setTotal(data.length);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApprove = async (releaseRestriction: boolean = false) => {
    try {
      await approveOng(ongToApprove.id, releaseRestriction);
      toast.success('ONG aprovada!');
      setOngToApprove(null);
      setSelectedOng(null);
      loadOngs();
      if (onUpdate) onUpdate();
    } catch (error) {
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
      loadOngs();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Falha na rejeição');
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
      <div className={`${config.bg} border-b ${config.border} p-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-black ${config.color} tracking-tight`}>{config.title}</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Total: {total}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-3 hover:bg-white/60 rounded-2xl transition-all"><X size={24} className={config.color} /></button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-[6px] border-purple-100 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            {/* CABEÇALHO OPACO: bg-gray-50 sólido e z-index garantido */}
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">Nome</th>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">E-mail</th>
                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">CNPJ</th>
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
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-20 hover:bg-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / itemsPerPage), p + 1))} disabled={currentPage >= total / itemsPerPage} className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-20 hover:bg-white transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {/* Modais */}
      <DetailsModal ong={selectedOng} status={status} onClose={() => setSelectedOng(null)} onApproveClick={(ong: any) => setOngToApprove(ong)} onRejectClick={(id: number) => setOngToRejectId(id)} />
      <ApproveModal isOpen={!!ongToApprove} ong={ongToApprove} status={status} onClose={() => setOngToApprove(null)} onConfirm={handleConfirmApprove} />
      <RejectModal isOpen={!!ongToRejectId} reason={rejectReason} setReason={setRejectReason} onClose={() => { setOngToRejectId(null); setRejectReason(''); }} onConfirm={handleConfirmReject} />
    </div>
  );
}