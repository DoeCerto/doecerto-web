import { api } from "./api";
import type { OngAsaasKycDocument, OngAsaasKycSummary } from "./ongs-profile.service";

export type { OngAsaasKycDocument, OngAsaasKycSummary };

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
  auditResults?: Record<string, unknown>[];
  asaasAccountId?: string;
  asaasWalletId?: string;
  asaasAccountStatus?: string;
  hasCompleteAsaasProfileData?: boolean;
  missingAsaasProfileFields?: string[];
}

type RawRecord = Record<string, unknown>;

// --- Normalização Simplificada ---
function normalizeOng(raw: RawRecord, status: OngStatus): OngAdminData {
  // Garante que dados aninhados (ex: raw.ong) subam para o nível principal
  const nestedOng = (raw.ong && typeof raw.ong === 'object' ? raw.ong : {}) as RawRecord;
  const nestedUser = (raw.user && typeof raw.user === 'object' ? raw.user : {}) as RawRecord;
  const data: RawRecord = { ...raw, ...nestedOng, ...nestedUser };

  return {
    id: Number(data.id ?? data.userId ?? data.ongId ?? 0),
    name: String(data.name ?? data.fullName ?? 'Nome não informado'),
    email: String(data.email ?? data.contactEmail ?? ''),
    cnpj: String(data.cnpj ?? data.document ?? ''),
    bio: (data.bio ?? data.description ?? '') as string,
    contactNumber: (data.contactNumber ?? data.phone ?? '') as string,
    address: (data.address ?? data.location ?? '') as string,
    status: status, // Forçamos o status baseado na rota chamada
    rejectionReason: (data.rejectionReason ?? data.rejectionMessage) as string | undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    presidentName: data.presidentName as string | undefined,
    presidentCpf: data.presidentCpf as string | undefined,
    estatutoUrl: data.estatutoUrl as string | undefined,
    ataUrl: data.ataUrl as string | undefined,
    cartaoCnpjUrl: data.cartaoCnpjUrl as string | undefined,
    riskScore: data.riskScore as number | undefined,
    isRestricted: data.isRestricted as boolean | undefined,
    lastAuditAt: data.lastAuditAt as string | undefined,
    auditResults: data.auditResults as Record<string, unknown>[] | undefined,
    asaasAccountId: (data.asaasAccountId as string | null | undefined) ?? undefined,
    asaasWalletId: (data.asaasWalletId as string | null | undefined) ?? undefined,
    asaasAccountStatus: data.asaasAccountStatus as string | undefined,
    hasCompleteAsaasProfileData:
      typeof data.hasCompleteAsaasProfileData === 'boolean'
        ? data.hasCompleteAsaasProfileData
        : undefined,
    missingAsaasProfileFields: Array.isArray(data.missingAsaasProfileFields)
      ? (data.missingAsaasProfileFields as string[])
      : undefined,
  };
}

export interface AdminPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransferAdminItem {
  id: number;
  ongId: number;
  ongName: string;
  ongEmail: string | null;
  ongCnpj: string | null;
  totalAmount: number;
  asaasTransferId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transferredAt: string | null;
  errorMessage: string | null;
  donationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnderReviewDonationItem {
  id: number;
  publicId: string;
  donationType: 'monetary' | 'material';
  donationStatus: string;
  monetaryAmount: number;
  tipAmount: number;
  asaasPaymentId: string | null;
  asaasNetValue: number | null;
  asaasFee: number | null;
  refundReason: string | null;
  isAnonymous: boolean;
  transferId: number | null;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
  ong: {
    id: number;
    name: string;
    email: string | null;
    cnpj: string | null;
    asaasAccountStatus: string | null;
  };
  donor: {
    id: number | null;
    name: string;
    email: string | null;
    isGuest: boolean;
  };
}

export interface AuditLogItem {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

type PaginatedOngApiPayload = RawRecord[] | { data?: RawRecord[]; total?: number };

function parseOngListResponse(payload: PaginatedOngApiPayload | undefined, status: OngStatus) {
  const rawList = Array.isArray(payload) ? payload : (payload?.data || []);
  const total = !Array.isArray(payload) ? (payload?.total ?? rawList.length) : rawList.length;

  return {
    data: rawList.map((item) => normalizeOng(item, status)),
    total,
  };
}

// --- Serviços de Leitura ---
export async function getOngsByStatus(
  status: OngStatus,
  skip = 0,
  limit = 10,
  q?: string
) {
  // Ajuste: O front usa 'approved', mas a rota da API é 'verified'
  const apiStatus = status === 'approved' ? 'verified' : status;
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (q && q.trim()) {
    params.set('q', q.trim());
  }

  const res = await api<PaginatedOngApiPayload>(`/ongs/status/${apiStatus}?${params.toString()}`);
  return parseOngListResponse(res.data, status);
}

export async function searchOngs(
  searchTerm: string,
  status: OngStatus,
  skip = 0,
  limit = 10
) {
  const apiStatus = status === 'approved' ? 'verified' : status;
  const params = new URLSearchParams({
    q: searchTerm.trim(),
    status: apiStatus,
    skip: String(skip),
    limit: String(limit),
  });

  const res = await api<PaginatedOngApiPayload>(`/ongs/search?${params.toString()}`);
  return parseOngListResponse(res.data, status);
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

export interface AdminProfileResponse {
  userId: number;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface SyncOngAsaasResponse {
  userId: number;
  asaasAccountId: string | null;
  asaasWalletId: string | null;
  asaasAccountStatus: string;
  webhookConfigured?: boolean;
}

export interface SyncAsaasBatchDetail {
  ongId: number;
  name: string;
  outcome: 'created' | 'synced' | 'skipped_incomplete' | 'failed';
  missingFields?: string[];
  error?: string;
}

export interface SyncAsaasBatchResponse {
  processed: number;
  created: number;
  synced: number;
  skippedIncomplete: number;
  failed: number;
  details: SyncAsaasBatchDetail[];
}

export async function getMyProfile() {
  const { data } = await api<AdminProfileResponse>('/admins/me');
  return data;
}

export async function syncOngAsaas(ongId: number) {
  const { data } = await api<SyncOngAsaasResponse>(`/ongs/${ongId}/sync-asaas`, {
    method: "POST",
  });
  return data;
}

export async function syncPendingAsaasBatch(limit?: number) {
  const { data } = await api<SyncAsaasBatchResponse>('/ongs/sync-asaas-batch', {
    method: "POST",
    body: JSON.stringify(limit ? { limit } : {}),
  });
  return data;
}

export async function getOngAsaasKycStatus(ongId: number) {
  const { data } = await api<OngAsaasKycSummary>(`/ongs/${ongId}/asaas-status`);
  return data;
}

export async function getAdminTransfers(params?: {
  status?: string;
  ongId?: number;
  page?: number;
  limit?: number;
}): Promise<{ data: TransferAdminItem[]; meta: AdminPaginationMeta }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.ongId) query.set('ongId', String(params.ongId));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const { data } = await api<{ data: TransferAdminItem[]; meta: AdminPaginationMeta }>(
    `/admin/transfers${qs ? `?${qs}` : ''}`
  );
  return data;
}

export async function getUnderReviewDonations(
  page = 1,
  limit = 20
): Promise<{ data: UnderReviewDonationItem[]; meta: AdminPaginationMeta }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const { data } = await api<{ data: UnderReviewDonationItem[]; meta: AdminPaginationMeta }>(
    `/admin/donations/under-review?${query.toString()}`
  );
  return data;
}

export async function resolveUnderReviewDonation(
  donationId: number,
  payload: { action: 'approve' | 'refund'; reason?: string }
) {
  const { data } = await api<{
    id: number;
    donationStatus: string;
    action: 'approve' | 'refund';
  }>(`/admin/donations/${donationId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getAuditLogs(params?: {
  action?: string;
  resource?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AuditLogItem[]; meta: AdminPaginationMeta }> {
  const query = new URLSearchParams();
  if (params?.action) query.set('action', params.action);
  if (params?.resource) query.set('resource', params.resource);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const { data } = await api<{ data: AuditLogItem[]; meta: AdminPaginationMeta }>(
    `/admin/audit-logs${qs ? `?${qs}` : ''}`
  );
  return data;
}