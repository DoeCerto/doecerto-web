import { api } from "./api";

export interface BankAccountData {
  bankName: string;
  agencyNumber: string;
  accountNumber: string;
  accountType: string;
  pixKey: string;
  currentPassword?: string;
}

export const BankAccountService = {
  // Busca a conta da ONG logada
  getMyAccount: async (): Promise<BankAccountData | null> => {
    try {
      const response = await api("/ongs/bank-account/me");
      const data = (response.data || response) as BankAccountData | BankAccountData[]; 
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      return null;
    }
  },

  // Salva ou Atualiza
  saveAccount: async (data: BankAccountData) => {
    try {
      const existing = await BankAccountService.getMyAccount();
      
      // Se já existe, usamos PATCH, se não, POST
      const method = existing ? "PATCH" : "POST";

      const response = await api("/ongs/bank-account/me", {
        method,
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

 // Busca a conta da ONG
getPublicAccount: async (ongId: number): Promise<BankAccountData[]> => {
  try {
    const response = await api<BankAccountData[]>(`/ongs/bank-account/${ongId}`);
    
    const rawData = response.data;

    if (!rawData) return [];

    return Array.isArray(rawData) ? rawData : [rawData as unknown as BankAccountData];
    
  } catch (e: any) {
    console.error(`❌ Erro:`, e);
    throw e;
  }
},
};