import { api } from "@/services/api";

export interface Ong {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface CatalogSection {
  items: Ong[]; 
}

export async function getVerifiedOngs(): Promise<Ong[]> {
  try {

    const res = await api<CatalogSection[]>("/catalog");

    const all = res.data.flatMap((section) => section.items || []);
    
    return Array.from(
      new Map(
        all.map((o: Ong) => [o.id, { id: o.id, name: o.name, avatarUrl: o.avatarUrl }])
      ).values()
    );
  } catch (error) {
    console.error("Erro ao buscar catálogo:", error);
    return [];
  }
}