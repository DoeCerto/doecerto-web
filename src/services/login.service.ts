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
  if (typeof document !== "undefined") {
    document.cookie = "user_avatar=; path=/; max-age=0";
    document.cookie = "user_name=; path=/; max-age=0";
  }
  return await api("/auth/logout", {
    method: "POST",
  });
}

export async function getMe() {
  try {
    return await api<{ user: any }>("/auth/me", {
      method: "GET",
    });
  } catch (error: any) {
    const isUnauthorized =
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.message?.includes("401") ||
      error?.message?.toLowerCase().includes("jwt token") ||
      error?.message?.toLowerCase().includes("unauthorized");

    if (isUnauthorized) {
      return { data: { user: null } };
    }
    throw error;
  }
}