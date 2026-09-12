import HomeClient from "./HomeClient";
export const dynamic = "force-dynamic";
export default async function HomePageServer() {
  let initialCatalog = [];
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Busca apenas os dados PÚBLICOS do catálogo para o Google e carregamento rápido
    const res = await fetch(`${apiUrl}/catalog`, { cache: "no-store" });
    if (res.ok) initialCatalog = await res.json();
  } catch (error) {
    console.error("Erro ao buscar catálogo estático:", error);
  }

  return (
    <HomeClient 
      initialCatalog={initialCatalog} 
      // Passamos false/null inicialmente. 
      // O useEffect do HomeClient vai ler o token do Capacitor/LocalStorage e atualizar a tela.
      initialIsAuthenticated={false}
      initialUserName={null}
      initialUserRole={null}
    />
  );
}