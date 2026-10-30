import { api } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DonationService {
  id: number;
  type: 'monetary' | 'material';
  amount?: number;
  materialDescription?: string;
  materialQuantity?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  proofUrl?: string;
  createdAt: string;
  donor?: {
    user: {
      name: string;
    };
    profile?: {
      contactNumber?: string;
    };
  };
}

export const DonationService = {
  /**
   * Registra uma doação material
   * Rota: POST /donations
   */
  async createMaterialDonation(ongId: number, payload: {
    wishlistItemId: number | null | string;
    quantity: number;
    description: string;
    isAnonymous?: boolean;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    acceptedTerms?: boolean;
    turnstileToken?: string;
  }) {
    try {
      const body: any = {
        ongId: Number(ongId),
        materialQuantity: payload.quantity.toString(),
        materialDescription: payload.description,
        donationType: 'material'
      };

      if (payload.isAnonymous !== undefined) {
        body.isAnonymous = payload.isAnonymous;
      }
      if (payload.guestEmail) body.guestEmail = payload.guestEmail;
      if (payload.guestName) body.guestName = payload.guestName;
      if (payload.guestPhone) body.guestPhone = payload.guestPhone;
      if (payload.acceptedTerms !== undefined) body.acceptedTerms = payload.acceptedTerms;
      if (payload.turnstileToken) body.turnstileToken = payload.turnstileToken;

      const response = await api<any>(`/donations`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      return response?.data ?? response;
    } catch (error: any) {
      console.error("❌ Erro retornado pelo servidor:", error);
      throw error;
    }
  },

  async getReceivedDonations(params?: { type?: 'monetary' | 'material'; skip?: number; take?: number }) {
    try {
      const queryString = params && Object.keys(params).length > 0
        ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null) as any).toString()}`
        : '';

      const response = await api<any>(`/donations/me/received${queryString}`);
      const rawArray = response?.data?.data?.data || response?.data?.data || response?.data || [];

      if (!Array.isArray(rawArray)) return [];

      return rawArray.map((item: any) => {
        let formattedProofUrl = item.proofOfPaymentUrl || item.proofUrl;
        if (formattedProofUrl && !formattedProofUrl.startsWith('http')) {
          const cleanPath = formattedProofUrl.replace(/\\/g, '/').replace(/^\/+/, '');
          formattedProofUrl = `${API_URL}/${cleanPath}`;
        }

        return {
          id: item.id,
          type: item.donationType?.toLowerCase() || 'material',
          status: item.donationStatus?.toUpperCase() || 'PENDING',
          amount: item.monetaryAmount,
          materialDescription: item.materialDescription,
          materialQuantity: item.materialQuantity,
          proofUrl: formattedProofUrl,
          createdAt: item.createdAt,
          isAnonymous: item.isAnonymous,
          donor: {
            user: {
              name: item.isAnonymous
                ? "Doador Anônimo"
                : (item.donor?.user?.name || item.guestName || "Doador Anônimo")
            },
            profile: {
              contactNumber: item.donor?.profile?.contactNumber || item.guestPhone || ""
            }
          }
        };
      }) as DonationService[];
    } catch (error) {
      console.error("Erro ao buscar doações:", error);
      return [];
    }
  },

  async acceptDonation(id: number) {
    const response = await api<any>(`/donations/${id}/accept`, { method: 'PATCH' });
    return response?.data ?? response;
  },

  async rejectDonation(id: number) {
    const response = await api<any>(`/donations/${id}/reject`, { method: 'PATCH' });
    return response?.data ?? response;
  },

  async getDonationById(id: number) {
    const response = await api<any>(`/donations/${id}`);
    return response?.data ?? response;
  }
};
