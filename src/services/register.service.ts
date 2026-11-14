import { api } from "@/services/api";

export interface RegisterDonorDTO {
  name: string;
  email: string;
  password: string;
  cpf: string;
  contactNumber?: string;
}

export function registerDonor(data: RegisterDonorDTO) {
  return api<void>("/auth/register/donor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CheckAvailabilityQuery {
  email?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  field?: "email" | "cpf" | "cnpj" | "phone";
  message?: string;
  rateLimited?: boolean;
}

export async function checkAvailability(query: CheckAvailabilityQuery): Promise<CheckAvailabilityResponse> {
  try {
    const params = new URLSearchParams();
    if (query.email) params.set("email", query.email);
    if (query.cpf) params.set("cpf", query.cpf);
    if (query.cnpj) params.set("cnpj", query.cnpj);
    if (query.phone) params.set("phone", query.phone);

    const res = await api<CheckAvailabilityResponse>(`/auth/check-availability?${params.toString()}`);
    return res.data;
  } catch (err: any) {
    if (
      err?.status === 429 ||
      err?.statusCode === 429 ||
      err?.message?.includes("ThrottlerException") ||
      err?.message?.includes("Too Many Requests") ||
      err?.message?.includes("Muitas tentativas") ||
      err?.message?.includes("Muitas requisições")
    ) {
      return {
        available: false,
        rateLimited: true,
        message: "Muitas tentativas em pouco tempo. Por favor, aguarde alguns segundos antes de tentar novamente.",
      };
    }
    return {
      available: false,
      message: err?.message || "Dado já cadastrado no sistema.",
    };
  }
}
