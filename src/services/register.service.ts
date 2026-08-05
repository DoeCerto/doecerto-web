import { api } from "@/services/api";

export interface RegisterDonorDTO {
  name: string;
  email: string;
  password: string;
  cpf: string;
  contactNumber: string;
}

export function registerDonor(data: RegisterDonorDTO) {
  return api<void>("/auth/register/donor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
