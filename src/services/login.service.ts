import { api } from "@/services/api";

interface LoginDTO {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: {
    role?: string;
    // add other user fields if needed
  };
}

export async function login(data: LoginDTO) {
  
  return await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return await api("/auth/logout", {
    method: "POST",
  });
}

export async function getMe() {
  return await api<{ user: any }>("/auth/me", {
    method: "GET",
  });
}