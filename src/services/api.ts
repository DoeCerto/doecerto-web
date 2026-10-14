import { Preferences } from '@capacitor/preferences';

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
  if (typeof window !== "undefined") {
    const { value } = await Preferences.get({ key: "access_token" });
    token = value;

    if (!token) {
      token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
    }
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
          // Tentativa de renovar o token (Silent Refresh)
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Envia os cookies (refresh_token)
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            
            if (typeof window !== "undefined" && refreshData.accessToken) {
              await Preferences.set({ key: "access_token", value: refreshData.accessToken });
              localStorage.setItem("access_token", refreshData.accessToken);
            }

            // Refaz a request original com o novo token
            headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
              credentials: "include",
            });

            const retryText = await retryRes.text();
            if (retryRes.ok) {
              return { data: retryText ? JSON.parse(retryText) : (null as any) };
            }
            throw new ApiError(retryText || `Erro ${retryRes.status}`, retryRes.status);
          }
        } catch (refreshErr) {
          // Silent refresh falhou de forma esperada quando não há cookie de renovação
        }

        // Se chegou aqui, o refresh falhou (token de renovação expirou ou é inexistente)
        if (typeof window !== "undefined") {
          await Preferences.remove({ key: "access_token" });
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

    return { data: text ? JSON.parse(text) : (null as any) };
  } catch (error: any) {
    // Evita o popup vermelho chato do Next.js no Dev mode para erros 401 (normais quando usuário é visitante)
    const isUnauthorized =
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.message?.includes("401") ||
      error?.message?.toLowerCase().includes("jwt token") ||
      error?.message?.toLowerCase().includes("unauthorized") ||
      error?.message?.toLowerCase().includes("não autorizado");

    if (!isUnauthorized) {
      console.error("[API ERROR]", error);
    }
    throw error;
  }
}