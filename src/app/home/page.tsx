import HomeClient from "./HomeClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function parseJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
      return JSON.parse(jsonPayload);
    }
  } catch {
    // Retorna null silenciosamente se não for um JWT válido
  }
  return null;
}

export default async function HomePageServer() {
  let initialCatalog = [];
  let isAuthenticated = false;
  let initialUserName: string | null = null;
  let initialUserAvatar: string | null = null;
  let initialUserRole: string | null = null;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("refresh_token")?.value;
    if (token) {
      isAuthenticated = true;
      const payload = parseJwtPayload(token);
      if (payload) {
        initialUserName = payload.name || null;
        initialUserAvatar = payload.avatarUrl || null;
        initialUserRole = payload.role || null;
      }
    }

    // Padrão Netflix (Cookie "pas" / Atributos Rápidos):
    // Se o usuário trocou de foto recentemente, o cookie rápido reflete a nova foto antes do JWT ser recriado
    const fastAvatar = cookieStore.get("user_avatar")?.value;
    const fastName = cookieStore.get("user_name")?.value;
    if (fastAvatar) initialUserAvatar = decodeURIComponent(fastAvatar);
    if (fastName) initialUserName = decodeURIComponent(fastName);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/catalog`, { cache: "no-store" });
    if (res.ok) initialCatalog = await res.json();
  } catch (error) {
    console.error("Erro ao buscar catálogo estático:", error);
  }

  return (
    <HomeClient 
      initialCatalog={initialCatalog} 
      initialIsAuthenticated={isAuthenticated}
      initialUserName={initialUserName}
      initialUserAvatar={initialUserAvatar}
      initialUserRole={initialUserRole}
    />
  );
}