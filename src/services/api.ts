import { Preferences } from '@capacitor/preferences';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  if (token) {
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
            throw new Error(retryText || `Erro ${retryRes.status}`);
          }
        } catch (refreshErr) {
          console.error("Falha ao renovar token:", refreshErr);
        }

        // Se chegou aqui, o refresh falhou (token de renovação expirou ou é inválido)
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
      throw new Error(text || `Erro ${res.status}`);
    }

    return { data: text ? JSON.parse(text) : (null as any) };
  } catch (error: any) {
    // Evita o popup vermelho chato do Next.js no Dev mode para erros 401 (que são normais quando o usuário não está logado)
    if (!error?.message?.includes("401")) {
      console.error("[API ERROR]", error);
    }
    throw error;
  }
}