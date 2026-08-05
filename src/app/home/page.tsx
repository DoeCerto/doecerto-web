import { cookies } from "next/headers";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic';

// Função robusta para extrair nome e role de dentro do JWT no servidor
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      name: payload?.name || null,
      role: payload?.role || null,
    };
  } catch (e) {
    return { name: null, role: null };
  }
}

export default async function HomePageServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!token;

  // Pega o nome e o role instantaneamente de dentro do JWT do back-end
  const { name: initialUserName, role: initialUserRole } = token 
    ? decodeJwtPayload(token) 
    : { name: null, role: null };

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
      initialUserRole={initialUserRole}
    />
  );
}