import { api } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const OngsProfileService = {
  _formatImageUrl(path: string | null) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `${API_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  },

  _calculateYears(createdAt: string | Date) {
    const yearCreated = new Date(createdAt).getFullYear();
    const diff = new Date().getFullYear() - yearCreated;
    return diff <= 0 ? "Novo" : `${diff} ${diff === 1 ? "ano" : "anos"}`;
  },

  async getPublicProfile(ongId: number) {
    try {
      const [resBase, resProfile, resReviews] = await Promise.all([
        api<any>(`/ongs/${ongId}`).catch(() => ({ data: {} })),
        api<any>(`/ongs/${ongId}/profile`).catch(() => ({ data: {} })),
        api<any>(`/ongs/${ongId}/ratings`).catch(() => ({ data: [] })),
      ]);

      const base = resBase.data;
      const profile = resProfile.data;

      // Normalização da descrição
      const descriptionText =
        profile.description ||
        profile.about ||
        profile.bio ||
        "ONG verificada.";

      // Normalização do Website
      let websiteLink = "Não informado";
      const urls = profile.websiteUrls || profile.website || [];
      if (Array.isArray(urls) && urls.length > 0) {
        websiteLink = urls[0];
      } else if (typeof urls === "string") {
        websiteLink = urls;
      }

      return {
        id: base.id || profile.id || ongId,
        name: profile.name || base.name || "ONG sem nome",
        cnpj: base.cnpj || "CNPJ não informado",
        banner: this._formatImageUrl(profile.bannerUrl || base.bannerUrl),
        logo: this._formatImageUrl(profile.avatarUrl || base.avatarUrl),
        description: descriptionText,
        phone: profile.contactNumber || base.contactNumber || "Não informado",
        website: websiteLink !== "Não informado" ? [websiteLink] : [],
        address: profile.address?.city
          ? `${profile.address.city}, ${profile.address.state}`
          : "Endereço não informado",
        yearsOfOperation: profile.yearsOfOperation,
        rating: Number(profile.rating?.average || 0),
        numberOfRatings: profile.rating?.count || 0,
        categories: profile.categories || [],
        reviews: Array.isArray(resReviews.data) ? resReviews.data : [],
        donations: profile.receivedDonations || 0,
        distance: base.distance || "—",
      };
    } catch (error) {
      console.error("Erro no getPublicProfile:", error);
      throw error;
    }
  },

  async getMyProfile() {
    const { data } = await api<any>("/ongs/me/profile");

    console.log("API PROFILE:", data);
    console.log("website", data.website);
    console.log("websiteUrls", data.websiteUrls);

    let websiteValue = "";

    if (
      data.websiteUrls &&
      Array.isArray(data.websiteUrls) &&
      data.websiteUrls.length > 0
    ) {
      websiteValue = data.websiteUrls[0];
    } else if (data.website && Array.isArray(data.website)) {
      websiteValue = data.website[0] || "";
    }

    return {
      ...data,
      name: data.name || "Minha ONG",

      description: data.description || data.about || data.bio || "",
      website: websiteValue,
      avatarUrl: this._formatImageUrl(data.avatarUrl),
      bannerUrl: this._formatImageUrl(data.bannerUrl),
      displayYears: this._calculateYears(data.createdAt || new Date()),
      stats: {
        donations: data.receivedDonations || 0,
        ratingAverage: Number(data.rating?.average) || 0,
      },
    };
  },

  async postReview(ongId: number, score: number, comment: string) {
    return api(`/ongs/${ongId}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comment }),
    });
  },
};
