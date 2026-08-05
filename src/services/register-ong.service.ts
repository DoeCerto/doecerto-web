import { api } from "@/services/api";

export interface RegisterOngDTO {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  contactNumber?: string;
}

export function registerOng(data: RegisterOngDTO) {
  return api<void>("/auth/register/ong", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
