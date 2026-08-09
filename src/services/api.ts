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
      // 👑 O PADRÃO OURO: Interceptação do 401
      if (res.status === 401) {
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
  } catch (error) {
    console.error("[API ERROR]", error);
    throw error;
  }
}