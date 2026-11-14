import { api } from './api';
import { DonorService } from './donor.service';

export interface OngAsaasKycSubDocument {
  id: string;
  status: string;
}

export interface OngAsaasKycDocument {
  id: string;
  status: 'NOT_SENT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'IGNORED' | string;
  type: string;
  title?: string;
  description?: string;
  onboardingUrl?: string | null;
  onboardingUrlExpirationDate?: string | null;
  responsible?: {
    name?: string;
    type?: string;
  };
  documents?: OngAsaasKycSubDocument[];
  canUploadViaApi: boolean;
}

export interface OngAsaasKycSummary {
  ongId: number;
  verificationStatus: string;
  hasSubaccount: boolean;
  asaasAccountId: string | null;
  asaasWalletId: string | null;
  asaasAccountStatus: string;
  hasCompleteProfileData: boolean;
  missingFields: string[];
  gatewayStatus: {
    general: string;
    commercialInfo?: string;
    bankAccountInfo?: string;
    documentation?: string;
  } | null;
  onboardingUrl: string | null;
  documents: OngAsaasKycDocument[];
  rejectReasons: string | null;
  pendingInitialization: boolean;
  provisionError?: string | null;
  provisionErrorCode?: string | null;
}

export interface SendAsaasKycDocumentResponse {
  id?: string;
  status?: string;
  sent: boolean;
  summary: OngAsaasKycSummary;
}

export interface OngProfileCategory {
  id: number;
  name: string;
}

export interface OngPublicReview {
  score: number;
  comment: string;
  createdAt: string;
  donor: { user: { name: string } };
}

export interface OngPublicProfile {
  id: number;
  name: string;
  cnpj: string;
  banner: string;
  logo: string;
  description: string;
  phone: string;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  website: string;
  instagram: string;
  address: string;
  foundedAt: string | null;
  yearsOfOperation: number;
  rating: number;
  numberOfRatings: number;
  categories: OngProfileCategory[];
  primaryCategory: OngProfileCategory | null;
  primaryCategoryId: number | null;
  reviews: OngPublicReview[];
  donations: number;
  distance: string;
  canReview: boolean;
}

export interface OngMyProfile {
  id: number;
  name: string;
  description: string;
  website: string;
  websiteUrl: string;
  websiteUrls?: string[];
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  contactNumber?: string | null;
  foundedAt: string | null;
  yearsOfOperation?: number | null;
  avatarUrl: string;
  bannerUrl: string;
  bannerPosition?: string;
  displayYears: string | number;
  hasAsaasSubaccount?: boolean;
  asaasAccountStatus?: string;
  verificationStatus?: string;
  hasEstatuto?: boolean;
  hasAta?: boolean;
  isRestricted?: boolean;
  cnpj?: string;
  categories?: OngProfileCategory[];
  primaryCategory?: OngProfileCategory | null;
  primaryCategoryId?: number | null;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  rating?: {
    average?: number | string;
    count?: number;
  } | null;
  stats: {
    donations: number;
    ratingAverage: number;
  };
  [key: string]: unknown;
}

export const OngsProfileService = {
  _formatImageUrl(path: string | null) {
    return DonorService._formatImageUrl(path) ?? "";
  },

  _calculateYears(createdAt: string | Date) {
    const yearCreated = new Date(createdAt).getFullYear();
    const diff = new Date().getFullYear() - yearCreated;
    return diff <= 0 ? "Novo" : `${diff} ${diff === 1 ? 'ano' : 'anos'}`;
  },

  buildPublicProfile(
    baseRaw: Record<string, unknown> | null | undefined,
    profileRaw: Record<string, unknown> | null | undefined,
    reviewsRaw: unknown,
    ongId: number,
  ): OngPublicProfile | null {
    const base = baseRaw ?? null;
    const profile = profileRaw ?? null;

    if (
      (!base || (!base.id && !base.name && !base.cnpj)) &&
      (!profile || (!profile.id && !profile.name))
    ) {
      return null;
    }

    const descriptionText =
      (typeof profile?.description === 'string' && profile.description) ||
      (typeof profile?.about === 'string' && profile.about) ||
      (typeof profile?.bio === 'string' && profile.bio) ||
      'ONG verificada.';

    const urls = profile?.websiteUrls || profile?.website || [];
    const legacyUrl =
      Array.isArray(urls) && urls.length > 0
        ? String(urls[0] || '')
        : typeof urls === 'string'
          ? urls
          : '';

    const websiteUrl = (typeof profile?.websiteUrl === 'string' ? profile.websiteUrl : legacyUrl).trim();
    const instagramUrl = (typeof profile?.instagramUrl === 'string' ? profile.instagramUrl : '').trim();
    const facebookUrl = (typeof profile?.facebookUrl === 'string' ? profile.facebookUrl : '').trim();
    const whatsappNumber = (typeof profile?.whatsappNumber === 'string' ? profile.whatsappNumber : '').trim();

    const categories = Array.isArray(profile?.categories)
      ? (profile.categories as OngProfileCategory[])
      : [];
    const primaryCategory =
      (profile?.primaryCategory as OngProfileCategory | null | undefined) ||
      (categories.length > 0 ? categories[0] : null);
    const primaryCategoryId =
      typeof profile?.primaryCategoryId === 'number'
        ? profile.primaryCategoryId
        : categories.length > 0
          ? categories[0].id
          : null;

    const addressObj =
      profile?.address && typeof profile.address === 'object'
        ? (profile.address as { city?: string; state?: string })
        : null;
    const ratingObj =
      profile?.rating && typeof profile.rating === 'object'
        ? (profile.rating as { average?: number | string; count?: number })
        : null;

    return {
      id: Number(base?.id || profile?.id || ongId),
      name:
        (typeof profile?.name === 'string' && profile.name) ||
        (typeof base?.name === 'string' && base.name) ||
        'ONG sem nome',
      cnpj: (typeof base?.cnpj === 'string' && base.cnpj) || 'CNPJ não informado',
      banner: this._formatImageUrl(
        (typeof profile?.bannerUrl === 'string' ? profile.bannerUrl : null) ||
          (typeof base?.bannerUrl === 'string' ? base.bannerUrl : null)
      ),
      logo: this._formatImageUrl(
        (typeof profile?.avatarUrl === 'string' ? profile.avatarUrl : null) ||
          (typeof base?.avatarUrl === 'string' ? base.avatarUrl : null)
      ),
      description: descriptionText,
      phone:
        (typeof profile?.contactNumber === 'string' && profile.contactNumber) ||
        (typeof base?.contactNumber === 'string' && base.contactNumber) ||
        'Não informado',
      whatsappNumber: whatsappNumber || null,
      websiteUrl: websiteUrl || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      website: websiteUrl || 'Não informado',
      instagram: instagramUrl || websiteUrl || 'Não informado',
      address: addressObj?.city ? `${addressObj.city}, ${addressObj.state}` : 'Endereço não informado',
      foundedAt:
        (typeof profile?.foundedAt === 'string' && profile.foundedAt) ||
        (typeof base?.foundedAt === 'string' && base.foundedAt) ||
        null,
      yearsOfOperation:
        typeof profile?.yearsOfOperation === 'number' ? profile.yearsOfOperation : 0,
      rating: Number(ratingObj?.average || 0),
      numberOfRatings: Number(ratingObj?.count || 0),
      categories,
      primaryCategory,
      primaryCategoryId,
      reviews: Array.isArray(reviewsRaw) ? (reviewsRaw as OngPublicReview[]) : [],
      donations: Number(profile?.receivedDonations || 0),
      distance: (typeof base?.distance === 'string' && base.distance) || '—',
      canReview: Boolean(profile?.canReview),
    };
  },

  async getPublicProfile(ongId: number): Promise<OngPublicProfile> {
    try {
      const [resBase, resProfile, resReviews] = await Promise.all([
        api<Record<string, unknown> | null>(`/ongs/${ongId}`).catch(() => ({ data: null })),
        api<Record<string, unknown> | null>(`/ongs/${ongId}/profile`).catch(() => ({ data: null })),
        api<unknown[]>(`/ongs/${ongId}/ratings`).catch(() => ({ data: [] }))
      ]);

      const built = this.buildPublicProfile(
        resBase.data,
        resProfile.data,
        resReviews.data,
        ongId
      );

      // UX-03: Se nem os dados base nem o perfil público existirem, lança erro 404 explícito
      // em vez de renderizar "ONG sem nome" com selo de verificação falso.
      if (!built) {
        throw new Error("ONG não encontrada.");
      }

      return built;
    } catch (error) {
      console.error("Erro no getPublicProfile:", error);
      throw error;
    }
  },

  mapMyProfile(raw: Record<string, unknown> | null | undefined): OngMyProfile | null {
    if (!raw) return null;

    const websiteUrls = Array.isArray(raw.websiteUrls)
      ? raw.websiteUrls.filter((u): u is string => typeof u === "string")
      : undefined;
    const legacyWebsiteArr = Array.isArray(raw.website)
      ? raw.website.filter((u): u is string => typeof u === "string")
      : undefined;

    let websiteValue = typeof raw.websiteUrl === "string" ? raw.websiteUrl : "";
    if (!websiteValue && websiteUrls && websiteUrls.length > 0) {
      websiteValue = websiteUrls[0];
    } else if (!websiteValue && legacyWebsiteArr && legacyWebsiteArr.length > 0) {
      websiteValue = legacyWebsiteArr[0] || "";
    }

    const ratingObj =
      raw.rating && typeof raw.rating === "object"
        ? (raw.rating as { average?: number | string; count?: number })
        : null;

    const foundedAtValue = typeof raw.foundedAt === "string" ? raw.foundedAt : null;
    const createdAtValue =
      typeof raw.createdAt === "string" || raw.createdAt instanceof Date
        ? raw.createdAt
        : new Date();

    return {
      ...(raw as Record<string, unknown>),
      id: Number(raw.id || 0),
      name: (typeof raw.name === "string" && raw.name) || "Minha ONG",
      description:
        (typeof raw.description === "string" && raw.description) ||
        (typeof raw.about === "string" && raw.about) ||
        (typeof raw.bio === "string" && raw.bio) ||
        "",
      website: websiteValue,
      websiteUrl:
        (typeof raw.websiteUrl === "string" && raw.websiteUrl) || websiteValue || "",
      websiteUrls,
      instagramUrl: typeof raw.instagramUrl === "string" ? raw.instagramUrl : "",
      facebookUrl: typeof raw.facebookUrl === "string" ? raw.facebookUrl : "",
      whatsappNumber: typeof raw.whatsappNumber === "string" ? raw.whatsappNumber : "",
      foundedAt: foundedAtValue,
      avatarUrl: this._formatImageUrl(typeof raw.avatarUrl === "string" ? raw.avatarUrl : null),
      bannerUrl: this._formatImageUrl(typeof raw.bannerUrl === "string" ? raw.bannerUrl : null),
      displayYears:
        typeof raw.yearsOfOperation === "number"
          ? raw.yearsOfOperation
          : this._calculateYears(foundedAtValue || createdAtValue),
      stats: {
        donations: Number(raw.receivedDonations || 0),
        ratingAverage: Number(ratingObj?.average) || 0,
      },
    };
  },

  async getMyProfile(): Promise<OngMyProfile> {
    const { data } = await api<Record<string, unknown>>('/ongs/me/profile');
    return this.mapMyProfile(data) as OngMyProfile;
  },

  async postReview(ongId: number, score: number, comment: string) {
    return api(`/ongs/${ongId}/ratings`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, comment }),
    });
  },

  async uploadDocuments(formData: FormData) {
    return api<any>('/ongs/me/documents', {
      method: "POST",
      body: formData,
    });
  },

  async getMyAsaasKycStatus(): Promise<OngAsaasKycSummary> {
    const { data } = await api<OngAsaasKycSummary>('/ongs/me/asaas-status');
    return data;
  },

  async syncMyAsaasSubaccount(): Promise<OngAsaasKycSummary> {
    const { data } = await api<OngAsaasKycSummary>('/ongs/me/sync-asaas', {
      method: 'POST',
    });
    return data;
  },

  async submitAsaasKycDocument(
    documentGroupId: string,
    file: File,
    type?: string,
  ): Promise<SendAsaasKycDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }

    const { data } = await api<SendAsaasKycDocumentResponse>(
      `/ongs/me/asaas-documents/${encodeURIComponent(documentGroupId)}`,
      {
        method: "POST",
        body: formData,
      },
    );
    return data;
  },
};
