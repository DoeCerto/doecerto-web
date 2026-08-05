import { cookies } from "next/headers";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic';

// Função leve para extrair o nome de dentro do JWT no servidor
function decodeJwtName(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload)?.name || null;
  } catch (e) {
    return null;
  }
}

export default async function HomePageServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!token;

  // Pega o nome instantaneamente de dentro do JWT que o back-end já gera
  const initialUserName = token ? decodeJwtName(token) : null;

  let initialCatalog = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/catalog`, { cache: "no-store" });
    if (res.ok) initialCatalog = await res.json();
  } catch (error) {}

  return (
    <HomeClient 
      initialCatalog={initialCatalog} 
      initialIsAuthenticated={isAuthenticated}
      initialUserName={initialUserName}
    />
  );
}