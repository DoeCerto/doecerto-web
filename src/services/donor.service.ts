import { api } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UpdateProfileDTO {
  contactNumber?: string;
  description?: string;
}

export interface Address {
  id?: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
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

    if (!data) {
      const { data: userData } = await api<any>("/users/me");

      return {
        name: userData?.name || "",
        email: userData?.email || "",
        cpf: userData?.cpf || "",
        phone: "",
        avatarUrl: null,
        description: "",
        isNewProfile: true
      };
    }

    return {
      ...this._mapProfileData(data),
      isNewProfile: false
    };

  } catch (error: any) {
    console.error(error);

    throw error;
  }
},

// Adicione isso à classe DonorService no Frontend
async completeRegistration(data: { name: string; cpf: string; phone: string }) {
  // Chamada para a rota que criamos no backend
  const response = await api('/donors/profile/complete-register', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response;
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

  async getMyAddress(): Promise<Address | null> {
    try {
      const { data } = await api<any>("/addresses/me");
      return data || null;
    } catch (error) {
      console.warn("Erro ao buscar endereço:", error);
      return null;
    }
  },

  async updateAddress(payload: Partial<Address>): Promise<Address> {
    const { data } = await api<any>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    return data;
  },

  async createOrUpdateAddress(payload: Partial<Address>): Promise<Address> {
    const { data } = await api<any>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    return data;
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
  if (!data) {
    return {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      avatarUrl: null,
      description: ""
    };
  }

  const donor = data.donor || data;
  const user = donor.user || data.user || {};

  return {
    name: (user.name || donor.name || "").replace("undefined", "").trim(),
    email: user.email || donor.email || "",
    cpf: donor.cpf || "",
    phone: data.contactNumber || donor.contactNumber || "",
    avatarUrl: this._formatImageUrl(
      data.avatarUrl || donor.profile?.avatarUrl
    ),
    description: data.description || "",
  };
}



};