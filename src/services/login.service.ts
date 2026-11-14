import { api } from "@/services/api";
import { SecureStorageService } from "@/services/secure-storage.service";

interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleProfileSummary {
  name: string;
  email: string;
  picture: string | null;
}

export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  trustedDeviceToken?: string;
  email?: string;
  role?: string;
  user?: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string | null;
  };
  requires2FA?: boolean;
  requires2FASetup?: boolean;
  requiresOnboarding?: boolean;
  onboardingToken?: string;
  googleProfile?: GoogleProfileSummary;
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
  trustedDeviceToken?: string;
  user?: LoginResponse["user"];
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const candidate = err as {
      data?: { message?: unknown };
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };
    const raw =
      candidate.data?.message ?? candidate.response?.data?.message ?? candidate.message;
    if (Array.isArray(raw) && raw.length > 0) {
      return String(raw[0]);
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }
  }
  return fallback;
}

export async function login(data: LoginDTO) {
  const accountToken = await SecureStorageService.getTrustedDeviceToken(data.email);
  const customHeaders: Record<string, string> = {};
  if (accountToken) {
    customHeaders["x-trusted-device"] = accountToken;
  }

  return await api<LoginResponse>("/auth/login", {
    method: "POST",
    headers: customHeaders,
    body: JSON.stringify(data),
  });
}

export async function loginWithGoogle(payload: { accessToken?: string; idToken?: string }) {
  const body: { accessToken?: string; idToken?: string } = {};
  if (payload.accessToken) body.accessToken = payload.accessToken;
  if (payload.idToken) body.idToken = payload.idToken;

  return await api<LoginResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function completeGoogleDonorOnboarding(payload: {
  onboardingToken: string;
  cpf: string;
  name?: string;
  contactNumber?: string;
}) {
  const body: {
    onboardingToken: string;
    cpf: string;
    name?: string;
    contactNumber?: string;
  } = {
    onboardingToken: payload.onboardingToken,
    cpf: payload.cpf,
  };
  if (payload.name?.trim()) body.name = payload.name.trim();
  if (payload.contactNumber?.trim()) body.contactNumber = payload.contactNumber.trim();

  return await api<LoginResponse>("/auth/google/complete-donor", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verify2FALogin(
  tempToken: string,
  code: string,
  rememberDevice: boolean = true,
  email?: string,
) {
  const res = await api<LoginResponse>("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ tempToken, code, rememberDevice }),
  });

  if (email && res.data?.trustedDeviceToken) {
    await SecureStorageService.setTrustedDeviceToken(res.data.trustedDeviceToken, email);
  }

  return res;
}

export async function generate2FA(tempToken: string) {
  return await api<Generate2FAResponse>("/auth/2fa/generate", {
    method: "POST",
    body: JSON.stringify({ tempToken }),
  });
}

export async function enable2FA(
  tempToken: string,
  secret: string,
  code: string,
  rememberDevice: boolean = true,
  email?: string,
) {
  const res = await api<Enable2FAResponse>("/auth/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ tempToken, secret, code, rememberDevice }),
  });

  if (email && res.data?.trustedDeviceToken) {
    await SecureStorageService.setTrustedDeviceToken(res.data.trustedDeviceToken, email);
  }

  return res;
}

export async function persistClientSession(data: LoginResponse, fallbackEmail?: string) {
  const token = data?.accessToken || data?.access_token || data?.token;
  if (token) {
    try {
      await SecureStorageService.setAccessToken(token);
    } catch {}
  }

  const targetEmail = data?.user?.email || fallbackEmail;
  if (data?.trustedDeviceToken && targetEmail) {
    try {
      await SecureStorageService.setTrustedDeviceToken(data.trustedDeviceToken, targetEmail);
    } catch {}
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("registration_completed", "true");
  }

  let apiUserRole = data?.user?.role;
  if (!apiUserRole && token && token.includes(".")) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      apiUserRole = payload?.role;
    } catch {}
  }

  if (apiUserRole) {
    try {
      await SecureStorageService.setUserRole(apiUserRole);
    } catch {}
  }

  const userAvatar = data?.user?.avatarUrl;
  const userName = data?.user?.name;

  if (typeof window !== "undefined") {
    if (userAvatar) {
      localStorage.setItem("userAvatar", userAvatar);
      document.cookie = `user_avatar=${encodeURIComponent(userAvatar)}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (userName) {
      localStorage.setItem("userName", userName);
      document.cookie = `user_name=${encodeURIComponent(userName)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  return apiUserRole;
}

export async function revokeTrustedDevices(email?: string) {
  await SecureStorageService.removeTrustedDeviceToken(email);
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

export interface AuthenticatedMeUser {
  id?: number;
  email?: string;
  name?: string;
  role: string;
  avatarUrl?: string | null;
}

export async function getMe() {
  try {
    return await api<{ user: AuthenticatedMeUser | null }>("/auth/me", {
      method: "GET",
    });
  } catch (error: unknown) {
    const errObj =
      error && typeof error === "object"
        ? (error as { status?: number; statusCode?: number; message?: string })
        : {};
    const msg = typeof errObj.message === "string" ? errObj.message : "";
    const isUnauthorized =
      errObj.status === 401 ||
      errObj.statusCode === 401 ||
      msg.includes("401") ||
      msg.toLowerCase().includes("jwt token") ||
      msg.toLowerCase().includes("unauthorized");

    if (isUnauthorized) {
      return { data: { user: null } };
    }
    throw error;
  }
}