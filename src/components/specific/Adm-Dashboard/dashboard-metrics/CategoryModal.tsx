"use client";

import { useState, useEffect } from 'react';
import { X, Tag, Trash2, AlertTriangle } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory, type CategoryData } from '@/services/metrics.service';
import toast from 'react-hot-toast';

// --- INTERFACES ---
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory?: CategoryData | null;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: { id: string; name: string } | null;
}

// --- MODAL DE CADASTRO E EDIÇÃO ---
export function CategoryModal({ isOpen, onClose, onSuccess, editingCategory }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) setName(editingCategory.name);
    else setName('');
  }, [editingCategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nome da categoria é obrigatório');

    setLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: name.trim() });
        toast.success('Categoria atualizada!');
      } else {
        await createCategory({ name: name.trim() });
        toast.success('Categoria criada!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Tag size={26} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-purple-700 uppercase tracking-wider mb-2.5">Nome da Categoria</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Educação, Saúde..."
              className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-purple-300 focus:outline-none font-bold text-base text-slate-900 transition-all"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-base hover:bg-slate-200 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#6B39A7] text-white py-4 rounded-2xl font-black text-base hover:bg-[#5a2d8f] disabled:opacity-50 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]">
              {loading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL DE EXCLUSÃO ---
export function DeleteCategoryModal({ isOpen, onClose, onSuccess, category }: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCategory(Number(category.id));
      toast.success('Categoria excluída!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-gray-100">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50">
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Excluir Categoria?</h3>
        <p className="text-base sm:text-lg text-slate-600 font-medium mb-8 leading-relaxed">
          Você está prestes a apagar <strong className="text-red-600 font-bold">"{category.name}"</strong>. 
          Esta ação não pode ser desfeita.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-base hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? 'Apagando...' : <><Trash2 size={20} /> Sim, excluir</>}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}