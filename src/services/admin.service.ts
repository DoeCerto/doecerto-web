import { api } from "./api";

// --- Tipos ---
export type OngStatus = 'pending' | 'approved' | 'rejected' | 'restricted';

export interface OngAdminData {
  id: number;
  name: string;
  email: string;
  cnpj: string;
  bio?: string;
  contactNumber?: string;
  address?: string;
  status: OngStatus;
  rejectionReason?: string;
  createdAt: string;
  presidentName?: string;
  presidentCpf?: string;
  estatutoUrl?: string;
  ataUrl?: string;
  cartaoCnpjUrl?: string;
  riskScore?: number;
  isRestricted?: boolean;
  lastAuditAt?: string;
  auditResults?: any[];
}

interface ApiResponse {
  data: any[];
  total: number;
}

// --- Normalização Simplificada ---
function normalizeOng(raw: any, status: OngStatus): OngAdminData {
  // Garante que dados aninhados (ex: raw.ong) subam para o nível principal
  const data = { ...raw, ...(raw.ong || {}), ...(raw.user || {}) };

  return {
    id: data.id ?? data.userId ?? data.ongId,
    name: data.name ?? data.fullName ?? 'Nome não informado',
    email: data.email ?? data.contactEmail ?? '',
    cnpj: data.cnpj ?? data.document ?? '',
    bio: data.bio ?? data.description ?? '',
    contactNumber: data.contactNumber ?? data.phone ?? '',
    address: data.address ?? data.location ?? '',
    status: status, // Forçamos o status baseado na rota chamada
    rejectionReason: data.rejectionReason ?? data.rejectionMessage,
    createdAt: data.createdAt ?? new Date().toISOString(),
    presidentName: data.presidentName,
    presidentCpf: data.presidentCpf,
    estatutoUrl: data.estatutoUrl,
    ataUrl: data.ataUrl,
    cartaoCnpjUrl: data.cartaoCnpjUrl,
    riskScore: data.riskScore,
    isRestricted: data.isRestricted,
    lastAuditAt: data.lastAuditAt,
    auditResults: data.auditResults,
  };
}

// --- Serviços de Leitura ---
export async function getOngsByStatus(status: OngStatus, skip = 0, limit = 10) {
  // Ajuste: O front usa 'approved', mas a rota da API é 'verified'
  const apiStatus = status === 'approved' ? 'verified' : status;
  
  // ✅ CORREÇÃO APLICADA: parênteses ao redor do template literal
  const res = await api<any>(`/ongs/status/${apiStatus}?skip=${skip}&limit=${limit}`);

  // Suporta retorno direto de array ou objeto com { data, total }
  const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  const total = res.data?.total ?? rawList.length;

  return {
    data: rawList.map((item: any) => normalizeOng(item, status)),
    total
  };
}

export async function searchOngs(searchTerm: string, status: OngStatus) {
  const apiStatus = status === 'approved' ? 'verified' : status;
  
  // ✅ CORREÇÃO APLICADA: parênteses ao redor do template literal
  const res = await api<any>(`/ongs/search?q=${encodeURIComponent(searchTerm)}&status=${apiStatus}`);

  const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  const total = res.data?.total ?? rawList.length;

  return {
    data: rawList.map((item: any) => normalizeOng(item, status)),
    total
  };
}

// --- Serviços de Escrita (Ações) ---
export async function approveOng(ongId: number, releaseRestriction?: boolean) {
  // ✅ CORREÇÃO APLICADA: 
  // 1. Parênteses ao redor do template literal
  // 2. ongId convertido para string (API espera "numeric string")
  await api(`/ongs/${ongId}/verification/approve`, { 
    method: "PATCH",
    body: JSON.stringify({ ongId: ongId.toString(), releaseRestriction })
  });
}

export async function rejectOng(ongId: number, reason: string) {
  // ✅ CORREÇÃO APLICADA:
  // 1. Parênteses ao redor do template literal
  // 2. ongId convertido para string (API espera "numeric string")
  await api(`/ongs/${ongId}/verification/reject`, {
    method: "PATCH",
    body: JSON.stringify({ ongId: ongId.toString(), reason }),
  });
}

export async function getMyProfile() {
  const { data } = await api<any>('/admins/me');
  console.log('API response for /admins/me:', data);
  return data;
}