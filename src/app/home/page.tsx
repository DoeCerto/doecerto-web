import HomeClient from "./HomeClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePageServer() {
  let initialCatalog = [];
  let isAuthenticated = false;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("refresh_token")?.value;
    if (token) {
      isAuthenticated = true;
    }

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
      initialUserName={null}
      initialUserRole={null}
    />
  );
}