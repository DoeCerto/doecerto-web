import { Preferences } from '@capacitor/preferences';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T }> {
  const headers = new Headers(options.headers);

  // 1. Busca o token no Preferences (Nativo do Celular)
  let token = null;
  if (typeof window !== "undefined") {
    const { value } = await Preferences.get({ key: "access_token" });
    token = value;

    // Fallback para cookies (Web)
    if (!token) {
      token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
    }
  }

  console.log('Token found:', token ? 'Yes' : 'No');

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 2. Configuração de Headers
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!API_URL) {
    throw new Error("Configuração ausente: NEXT_PUBLIC_API_URL");
  }

  try {
    // ✅ CORREÇÃO: sintaxe correta do fetch com template literal
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", 
    });

    const text = await res.text();

    if (!res.ok) {
      if (res.status === 401) {
        await Preferences.remove({ key: "access_token" });
      }
      throw new Error(text || `Erro ${res.status}`);
    }

    return {
      data: text ? JSON.parse(text) : (null as any),
    };
  } catch (error) {
    console.error("[API ERROR]", error);
    throw error;
  }
}