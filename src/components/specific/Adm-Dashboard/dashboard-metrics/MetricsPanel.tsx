"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  Star, 
  Users,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Heart,
  Award
} from 'lucide-react';
import { getMetrics, getCategories, type MetricsData, type CategoryData } from '@/services/metrics.service';
// Importação dos dois modais do mesmo arquivo
import { CategoryModal, DeleteCategoryModal } from './CategoryModal'; 
import toast from 'react-hot-toast';

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);
  
  // Estados para controle dos modais
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const TAKE = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, categoriesResponse] = await Promise.all([
        getMetrics(),
        getCategories(0, TAKE)
      ]);
      setMetrics(metricsData);
      setCategories(categoriesResponse.data);
      setTotalCategories(categoriesResponse.total);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCategories = async () => {
    if (loadingMore || categories.length >= totalCategories) return;
    setLoadingMore(true);
    try {
      const response = await getCategories(categories.length, TAKE);
      setCategories(prev => [...prev, ...response.data]);
    } catch (error) {
      toast.error('Erro ao carregar mais categorias');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleActionSuccess = () => {
    loadData();
    setShowCategoryModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-[6px] border-purple-100 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel de Métricas</h1>
        <p className="text-slate-500 font-medium mt-1">Gerenciamento de Engajamento e Categorias</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard icon={<Building2 size={22} strokeWidth={2.5} />} title="ONGs Cadastradas" value={metrics?.generalStats.totalOngs.toString() || '0'} />
        <StatCard icon={<Users size={22} strokeWidth={2.5} />} title="Total de Doadores" value={metrics?.generalStats.totalDonors.toLocaleString('pt-BR') || '0'} />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RankingCard title="ONGs: Mais Doadas" icon={<Heart size={20} strokeWidth={2.5} />} items={metrics?.topOngsByDonationCount || []} accent="purple" valueFormatter={(val: number) => `${val} doações`} />
        <RankingCard title="Maiores Doadores" icon={<Award size={20} strokeWidth={2.5} />} items={metrics?.topDonorsByFrequency || []} accent="purple" valueFormatter={(val: number) => `${val} contribuições`} />
        <RankingCard title="Melhores Avaliadas" icon={<Star size={20} strokeWidth={2.5} />} items={metrics?.topPositiveRatings || []} accent="yellow" valueFormatter={(val: number) => <span className="flex items-center gap-1.5">{val.toFixed(1)} <Star size={14} className="fill-yellow-500 text-yellow-500" /></span>} />
        <RankingCard title="Avaliações Baixas" icon={<TrendingDown size={20} strokeWidth={2.5} />} items={metrics?.topNegativeRatings || []} accent="red" valueFormatter={(val: number) => <span className="flex items-center gap-1.5">{val.toFixed(1)} <Star size={14} className="fill-red-400 text-red-400" /></span>} />
      </div>

      {/* Análise de Categorias */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-2xl">
              <Tag size={24} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Distribuição por Categoria</h2>
          </div>
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 bg-[#6B39A7] text-white px-6 py-3 rounded-2xl font-black hover:bg-[#5a2d8f] transition-all shadow-lg"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
        </div>

        <div className="space-y-4">
          {metrics?.categoriesStats.map((cat, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-gray-900">{cat.name}</span>
                <span className="text-sm font-bold text-gray-500">{cat.count} ONGs ({cat.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Tag size={24} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Lista de Categorias</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Tag size={20} className="text-purple-600" />
                  </div>
                  <h3 className="font-black text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryModal(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length < totalCategories && (
          <div className="flex justify-center mt-6">
            <button onClick={loadMoreCategories} disabled={loadingMore} className="bg-[#6B39A7] text-white px-8 py-3 rounded-2xl font-black hover:bg-[#5a2d8f] disabled:opacity-50 shadow-lg transition-all">
              {loadingMore ? 'Carregando...' : 'Ver Mais'}
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleActionSuccess}
        editingCategory={selectedCategory}
      />

      {/* MODAL DE EXCLUSÃO */}
      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleActionSuccess}
        category={
          selectedCategory
            ? { id: String(selectedCategory.id), name: selectedCategory.name }
            : null
        }
      />
    </div>
  );
}

// --- COMPONENTES AUXILIARES (Cole no final do arquivo) ---

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-200 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-700 border border-purple-100">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RankingCard({ title, icon, items, accent, valueFormatter }: any) {
  const accentMap: Record<string, { iconBg: string; iconText: string; valueTxt: string; rankBg: string; rankText: string }> = {
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-700', valueTxt: 'text-purple-700', rankBg: 'bg-purple-50', rankText: 'text-purple-700' },
    yellow: { iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', valueTxt: 'text-yellow-600', rankBg: 'bg-yellow-50', rankText: 'text-yellow-700' },
    red:    { iconBg: 'bg-red-50',    iconText: 'text-red-500',    valueTxt: 'text-red-500',    rankBg: 'bg-red-50',    rankText: 'text-red-600' },
  };
  const a = accentMap[accent] || accentMap.purple;

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className={`p-2.5 ${a.iconBg} rounded-xl border border-slate-100`}>
          {React.cloneElement(icon, { className: a.iconText })}
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg ${a.rankBg} ${a.rankText} text-sm font-extrabold shrink-0`}>
                #{idx + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight truncate">{item.name}</p>
                {item.email && (
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{item.email}</p>
                )}
              </div>
            </div>
            <span className={`text-sm font-extrabold ${a.valueTxt} whitespace-nowrap ml-4`}>
              {valueFormatter(item.value)}
            </span>
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-400 font-medium text-sm">Nenhum dado disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}