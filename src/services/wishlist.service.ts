import { api } from "./api";

export interface WishlistItem {
  id: number;
  description: string;
  quantity: number;
  createdAt?: string;
}

export const WishlistService = {
  parseItems(payload: unknown): WishlistItem[] {
    let rawData: unknown = payload;

    // Se o backend envelopa em { data: [...] } ou { items: [...] }
    if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
      const record = rawData as Record<string, unknown>;
      rawData = record.data ?? record.items ?? rawData;
    }

    // Se ainda não for array, tenta achar algum array dentro do objeto
    if (!Array.isArray(rawData) && rawData && typeof rawData === "object") {
      const potentialArray = Object.values(rawData as Record<string, unknown>).find((val) =>
        Array.isArray(val)
      );
      if (potentialArray) rawData = potentialArray;
    }

    return Array.isArray(rawData) ? (rawData as WishlistItem[]) : [];
  },

  /**
   * Lista todos os itens da wishlist de uma ONG específica
   */
  async getItems(ongId: number): Promise<WishlistItem[]> {
    try {
      // Tipamos o retorno como 'any' para evitar o erro de propriedade 'data'
      const response = await api<any>(`/ongs/${ongId}/wishlist-items`, {
        method: "GET",
      }) as any;

      return this.parseItems(response?.data ?? response);
    } catch (error) {
      console.error("Erro ao buscar itens da wishlist:", error);
      return [];
    }
  },

  /**
   * Adiciona um novo item à lista de desejos (🏢 Apenas ONGs)
   */
  async addItem(ongId: number, description: string, quantity: number) {
    try {
      const response = await api<any>(`/ongs/${ongId}/wishlist-items`, { 
        method: "POST",
        body: JSON.stringify({ description, quantity }),
      }) as any;
      return response?.data ?? response;
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      throw error;
    }
  },

  /**
   * Atualiza descrição ou quantidade
   */
  async updateItem(ongId: number, itemId: number, updates: Partial<Pick<WishlistItem, 'description' | 'quantity'>>) {
    try {
      const response = await api<any>(`/ongs/${ongId}/wishlist-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }) as any;
      return response?.data ?? response;
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      throw error;
    }
  },

  /**
   * Remove um item
   */
  async deleteItem(ongId: number, itemId: number) {
    try {
      await api(`/ongs/${ongId}/wishlist-items/${itemId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      throw error;
    }
  }
};