import { api } from "@/services/api";

interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string | null;
  };
  requires2FA?: boolean;
  requires2FASetup?: boolean;
  tempToken?: string;
  message?: string;
}

export interface Generate2FAResponse {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface Enable2FAResponse {
  message: string;
  backupCodes: string[];
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export async function login(data: LoginDTO) {
  return await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verify2FALogin(tempToken: string, code: string, rememberDevice: boolean = true) {
  return await api<LoginResponse>("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ tempToken, code, rememberDevice }),
  });
}

export async function generate2FA(tempToken: string) {
  return await api<Generate2FAResponse>("/auth/2fa/generate", {
    method: "POST",
    body: JSON.stringify({ tempToken }),
  });
}

export async function enable2FA(tempToken: string, secret: string, code: string, rememberDevice: boolean = true) {
  return await api<Enable2FAResponse>("/auth/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ tempToken, secret, code, rememberDevice }),
  });
}

export async function revokeTrustedDevices() {
  return await api<{ message: string }>("/auth/2fa/trusted-devices/revoke", {
    method: "POST",
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