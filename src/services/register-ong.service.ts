import { api, ApiError } from "@/services/api";
import type { OngAsaasKycSummary } from "@/services/ongs-profile.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterOngDTO {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  contactNumber?: string;
}

export interface OngOnboardingSummary {
  status:
    | "subaccount_created"
    | "compliance_processing"
    | "compliance_inconclusive"
    | "compliance_restricted"
    | "awaiting_profile_data"
    | "awaiting_admin_review";
  hasSubaccount: boolean;
  asaasAccountStatus: string | null;
  onboardingUrl: string | null;
  pendingInitialization?: boolean;
  requiresAdminApproval: boolean;
  message: string;
}

export interface RegisterOngResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  profile: any;
  onboardingKycToken?: string;
  onboarding?: OngOnboardingSummary;
}

export interface CepLookupResult {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  provider: "brasilapi" | "viacep" | "cache";
}

export interface CnpjLookupResult {
  found: boolean;
  unavailable?: boolean;
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  foundedAt: string | null;
  yearsOfOperation: number | null;
  situacaoCadastral: string | null;
  isAtiva: boolean;
  phone: string | null;
  address: {
    zipCode: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
  };
  provider?: "brasilapi" | "receitaws" | "cache";
}

export interface PixKeyLookupResult {
  validFormat: boolean;
  normalizedPixKey: string;
  maskedPixKey: string;
  lookupAvailable: boolean;
  found: boolean;
  pixKey: string;
  keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";
  bankName: string | null;
  bankCode: string | null;
  ispb: string | null;
  agencyNumber: string | null;
  accountNumber: string | null;
  accountType: string | null;
  ownerName: string | null;
  ownerDocument: string | null;
  ownerMatchesCnpj?: boolean | null;
  reason?: string;
}

export type OnboardingKycStatusResponse = OngAsaasKycSummary & {
  complianceStatus?: {
    riskScore: number | null;
    isRestricted: boolean;
    lastAuditAt: string | null;
  };
};

export function registerOng(formData: FormData) {
  return api<RegisterOngResponse>("/auth/register/ong", {
    method: "POST",
    body: formData,
  });
}

export async function lookupCep(cep: string): Promise<CepLookupResult> {
  const cleanCep = cep.replace(/\D/g, "");
  const { data } = await api<CepLookupResult>(`/addresses/cep/${cleanCep}`);
  return data;
}

export async function lookupCnpj(cnpj: string): Promise<CnpjLookupResult> {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  const { data } = await api<CnpjLookupResult>(`/ongs/lookup/cnpj/${cleanCnpj}`);
  return data;
}

export async function lookupPixKey(pixKey: string, cnpj: string): Promise<PixKeyLookupResult> {
  const { data } = await api<PixKeyLookupResult>("/ongs/lookup/pix-key", {
    method: "POST",
    body: JSON.stringify({ pixKey, cnpj }),
  });
  return data;
}

/**
 * Consulta GET /ongs/me/asaas-status usando diretamente o `onboardingKycToken` escopado
 * emitido no cadastro da ONG, sem sobrescrever sessão de outros usuários e sem
 * disparar refresh/logout global em caso de expiração do token de acompanhamento.
 */
export async function fetchOnboardingAsaasKycStatus(
  onboardingKycToken: string,
): Promise<OnboardingKycStatusResponse> {
  if (!API_URL) {
    throw new Error("Configuração ausente: NEXT_PUBLIC_API_URL");
  }

  const res = await fetch(`${API_URL}/ongs/me/asaas-status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${onboardingKycToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message || `Erro ${res.status} ao consultar status de biometria.`;
    throw new ApiError(msg, res.status, json);
  }

  return json as OnboardingKycStatusResponse;
}
