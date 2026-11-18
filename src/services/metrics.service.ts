import { api } from "./api";

// --- Tipos ---
export interface CategoryData {
  id: number;
  name: string;
}

export interface MetricItem {
  id: number;
  name: string;
  email?: string;
  value: number;
  category?: string;
}

export interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
}

export interface GeneralStats {
  totalOngs: number;
  totalDonors: number;
}

export interface MetricsData {
  topOngsByDonationCount: MetricItem[]; // ONGs que mais receberam doações (Qtd)
  topDonorsByFrequency: MetricItem[];   // Doadores que mais doaram (Qtd)
  topPositiveRatings: MetricItem[];
  topNegativeRatings: MetricItem[];
  categoriesStats: CategoryStats[];
  generalStats: GeneralStats;
}

// --- Serviços de Categorias ---

export async function getCategories(skip = 0, take = 10): Promise<{ data: CategoryData[], total: number }> {
  const { data } = await api<any>(`/categories?skip=${skip}&take=${take}`);
  return {
    data: data.data || data,
    total: data.pagination?.total || data.total || 0
  };
}

export async function createCategory(categoryData: { name: string }): Promise<CategoryData> {
  const { data } = await api<any>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return data.data || data;
}

export async function updateCategory(id: number, categoryData: { name: string }): Promise<CategoryData> {
  const { data } = await api<any>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoryData),
  });
  return data.data || data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api(`/categories/${id}`, { method: 'DELETE' });
}

// --- Serviços de Métricas ---

export async function getMetrics(): Promise<MetricsData> {
  try {
    const { data } = await api<MetricsData>('/metrics');
    
    return {
      topOngsByDonationCount: data.topOngsByDonationCount || [],
      topDonorsByFrequency: data.topDonorsByFrequency || [],
      topPositiveRatings: data.topPositiveRatings || [],
      topNegativeRatings: data.topNegativeRatings || [],
      categoriesStats: data.categoriesStats || [],
      generalStats: data.generalStats || {
        totalOngs: 0,
        totalDonors: 0,
      }
    };
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
    // Retorna estrutura vazia em caso de erro
    return {
      topOngsByDonationCount: [],
      topDonorsByFrequency: [],
      topPositiveRatings: [],
      topNegativeRatings: [],
      categoriesStats: [],
      generalStats: {
        totalOngs: 0,
        totalDonors: 0,
      }
    };
  }
}

// --- Métricas Públicas de Impacto Social (Padrão Ouro) ---

export interface PublicImpactBreakdown {
  category: string;
  lives: number;
  icon: string;
}

export interface PublicImpactMetrics {
  totalLivesImpacted: number;
  totalDonations: number;
  totalMonetaryRaised: number;
  totalVerifiedOngs: number;
  totalDonors: number;
  breakdown: PublicImpactBreakdown[];
}

export async function getPublicImpactMetrics(): Promise<PublicImpactMetrics> {
  try {
    const { data } = await api<PublicImpactMetrics>('/metrics/public');
    return {
      totalLivesImpacted: data?.totalLivesImpacted ?? 0,
      totalDonations: data?.totalDonations ?? 0,
      totalMonetaryRaised: data?.totalMonetaryRaised ?? 0,
      totalVerifiedOngs: data?.totalVerifiedOngs ?? 0,
      totalDonors: data?.totalDonors ?? 0,
      breakdown: data?.breakdown || [],
    };
  } catch (error) {
    console.warn('Erro ao carregar métricas públicas de impacto:', error);
    return {
      totalLivesImpacted: 0,
      totalDonations: 0,
      totalMonetaryRaised: 0,
      totalVerifiedOngs: 0,
      totalDonors: 0,
      breakdown: [],
    };
  }
}