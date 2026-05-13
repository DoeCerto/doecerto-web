import { api } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UpdateProfileDTO {
  contactNumber?: string;
  description?: string;
}

export interface DonorProfileData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  avatarUrl: string | null;
  description: string;
  isNewProfile?: boolean;
}

export interface DonationHistory {
  id: number;
  donationType: "monetary" | "material";
  donationStatus: "pending" | "completed" | "canceled";
  monetaryAmount?: number;
  materialDescription?: string;
  createdAt: string;
  ong: {
    user: {
      name: string;
    };
  };
}

export const DonorService = {
  _formatImageUrl(path: string | null): string | null {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, "/");
    return `${API_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  },

  async getMyProfile(): Promise<DonorProfileData> {
    try {
      const { data } = await api<any>("/donors/me/profile");
      return {
        ...this._mapProfileData(data),
        isNewProfile: false
      };
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes("404")) {
        console.warn("Doador novo detectado (sem perfil no banco).");
        return {
          name: "",
          email: "",
          cpf: "",
          phone: "",
          avatarUrl: null,
          description: "",
          isNewProfile: true
        };
      }
      throw error;
    }
  },

  async updateProfile(payload: FormData | UpdateProfileDTO): Promise<DonorProfileData> {
    const isFormData = payload instanceof FormData;

    const { data } = await api<any>("/donors/me/profile", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? {} : { "Content-Type": "application/json" }
    });

    return this._mapProfileData(data);
  },

  async updateAccountName(name: string): Promise<void> {
    await api('/users/me', {
      method: "PATCH",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" }
    });
  },

  async getDonationHistory(): Promise<DonationHistory[]> {
    try {
      const response = await api<any>('/donations/me/sent', {
        method: 'GET',
      });

      const rawArray = response?.data?.data || response?.data || [];

      if (!Array.isArray(rawArray)) return [];

      return rawArray.map((d: any) => ({
        id: d.id,
        donationType: d.donationType.toLowerCase(),
        donationStatus: d.donationStatus.toLowerCase(),
        monetaryAmount: d.monetaryAmount,
        materialDescription: d.materialDescription,
        createdAt: d.createdAt,
        ong: {
          user: {
            name: d.ong?.user?.name || "Instituição"
          }
        }
      }));
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },

  _mapProfileData(data: any): DonorProfileData {
    if (!data) return { name: "", email: "", cpf: "", phone: "", avatarUrl: null, description: "" };

    const donor = data.donor || data;
    const user = donor.user || data.user || {};

    return {
      name: user.name || donor.name || "",
      email: user.email || donor.email || "",
      cpf: donor.cpf || "",
      phone: data.contactNumber || donor.contactNumber || "",
      avatarUrl: this._formatImageUrl(data.avatarUrl || donor.profile?.avatarUrl),
      description: data.description || "",
    };
  }
};