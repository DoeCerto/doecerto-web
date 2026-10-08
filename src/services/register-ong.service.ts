import { api } from "@/services/api";

export interface RegisterOngDTO {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  contactNumber?: string;
}

export function registerOng(formData: FormData) {
  return api<void>("/auth/register/ong", {
    method: "POST",
    body: formData,
    // When sending FormData, do NOT set 'Content-Type' header
    // fetch will automatically set 'Content-Type': 'multipart/form-data; boundary=...'
    headers: {
      // we pass an empty object or just don't set Content-Type
    }
  });
}
