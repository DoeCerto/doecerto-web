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
  address?: AddressData;
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

export interface AddressDTO {
  street: string;
  number: string;
  complement?: string | null; // Adicione o | null para maior segurança
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressData extends AddressDTO {
  id: number;
  donorId: number | null;
  ongId: number | null;
  createdAt: string;
  updatedAt: string;
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

  async getMyAddress(): Promise<AddressData | null> {
    try {
      const { data } = await api<any>("/addresses", { method: "GET" });

      const rawArray = data?.data || data || [];
      if (Array.isArray(rawArray) && rawArray.length > 0) {
        return rawArray[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar endereço do doador:", error);
      return null;
    }
  },

  async createAddress(payload: AddressDTO): Promise<AddressData> {
    const defaultPayload = { country: "Brasil", ...payload };

    const { data } = await api<any>("/addresses", {
      method: "POST",
      body: JSON.stringify(defaultPayload),
      headers: { "Content-Type": "application/json" }
    });

    return data;
  },

  async updateAddress(addressId: number, payload: Partial<AddressDTO>): Promise<AddressData> {
    const { data } = await api<any>(`/addresses/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    return data;
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
      address: data.address ? (data.address as AddressData) : undefined
    };
  }
};