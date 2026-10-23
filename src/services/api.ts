import { SecureStorageService } from '@/services/secure-storage.service';
import { getClientDeviceFingerprint } from '@/utils/device-fingerprint';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T }> {
  const headers = new Headers(options.headers);

  let token = null;
  let trustedDeviceToken = null;
  let deviceFingerprint = null;

  if (typeof window !== "undefined") {
    // 1. Bearer Token manual apenas em app mobile nativo (Capacitor)
    token = await SecureStorageService.getAccessToken();
    // 2. Token de Dispositivo Confiável (Keystore no Mobile, localStorage no Web)
    trustedDeviceToken = await SecureStorageService.getTrustedDeviceToken();
    // 3. Fingerprint determinístico de hardware e GPU
    deviceFingerprint = await getClientDeviceFingerprint();
  }

  function isTokenExpired(t: string): boolean {
    try {
      const base64Url = t.split('.')[1];
      if (!base64Url) return true;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded?.exp ? decoded.exp * 1000 <= Date.now() : true;
    } catch {
      return true;
    }
  }

  if (token && !isTokenExpired(token)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (trustedDeviceToken && !headers.has("x-trusted-device")) {
    headers.set("x-trusted-device", trustedDeviceToken);
  }

  if (deviceFingerprint && !headers.has("x-device-fingerprint")) {
    headers.set("x-device-fingerprint", deviceFingerprint);
  }

  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!API_URL) {
    throw new Error("Configuração ausente: NEXT_PUBLIC_API_URL");
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", 
    });

    const text = await res.text();

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        try {
          // Tentativa de renovar o token (Silent Refresh) via cookie httpOnly refresh_token
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Envia os cookies (refresh_token httpOnly)
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json().catch(() => ({}));
            
            if (refreshData?.accessToken) {
              await SecureStorageService.setAccessToken(refreshData.accessToken);
              headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
            }

            // Refaz a request original com credentials: "include" (novo cookie httpOnly injetado pelo backend)
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
              credentials: "include",
            });

            const retryText = await retryRes.text();
            if (retryRes.ok) {
              let retryData: any = null;
              try {
                retryData = retryText ? JSON.parse(retryText) : null;
              } catch {
                retryData = retryText;
              }
              if (retryData?.trustedDeviceToken && typeof window !== "undefined") {
                SecureStorageService.setTrustedDeviceToken(retryData.trustedDeviceToken).catch(() => {});
              }
              return { data: retryData as any };
            }
            throw new ApiError(retryText || `Erro ${retryRes.status}`, retryRes.status);
          }
        } catch (refreshErr) {
          // Silent refresh falhou de forma esperada quando não há cookie de renovação
        }

        // Se chegou aqui, o refresh falhou (token de renovação expirou ou é inexistente)
        if (typeof window !== "undefined") {
          await SecureStorageService.removeAccessToken();
          localStorage.removeItem("access_token");
          localStorage.removeItem("CapacitorStorage.access_token");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userAvatar");
          localStorage.removeItem("userName");
          localStorage.removeItem("registration_completed");

          // Dispara o evento global avisando que a sessão caiu
          window.dispatchEvent(new Event("auth_expired"));
        }
      }

      let parsedMessage = text;
      let jsonPayload: any = null;
      try {
        const json = JSON.parse(text);
        jsonPayload = json;
        if (json?.message) {
          parsedMessage = Array.isArray(json.message) ? json.message.join(", ") : json.message;
        } else if (json?.error) {
          parsedMessage = json.error;
        }
      } catch {
        /* noop */
      }
      throw new ApiError(parsedMessage || `Erro ${res.status}`, res.status, jsonPayload);
    }

    let parsedData: any = null;
    try {
      parsedData = text ? JSON.parse(text) : null;
    } catch {
      parsedData = text;
    }

    if (parsedData?.trustedDeviceToken && typeof window !== "undefined") {
      SecureStorageService.setTrustedDeviceToken(parsedData.trustedDeviceToken).catch(() => {});
    }

    return { data: parsedData as any };
  } catch (error: any) {
    // Evita o popup vermelho chato do Next.js no Dev mode para erros 401 (normais quando usuário é visitante)
    const isUnauthorized =
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.message?.includes("401") ||
      error?.message?.toLowerCase().includes("jwt token") ||
      error?.message?.toLowerCase().includes("unauthorized") ||
      error?.message?.toLowerCase().includes("não autorizado");

    const isClientError =
      (error?.status >= 400 && error?.status < 500) ||
      (error?.statusCode >= 400 && error?.statusCode < 500);

    // Evita disparar o overlay vermelho/preto de erro do Next.js Turbopack para erros esperados de validação (4xx)
    if (!isUnauthorized && !isClientError) {
      console.error("[API ERROR]", error);
    } else if (isClientError && !isUnauthorized && process.env.NODE_ENV !== "production") {
      console.warn("[API CLIENT ERROR]", error?.message || error);
    }
    throw error;
  }

}