"use client";

import Image from 'next/image';
import { useState } from 'react';
import {
  User,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import MetricsPanel from '../specific/Adm-Dashboard/dashboard-metrics/MetricsPanel';
import { useAuth } from '@/contexts/AuthContext';

type AdminLayoutProps = {
  children: React.ReactNode;
  activeMenu?: 'home' | 'dashboard';
  adminName?: string;
  onMenuChange?: (menu: 'home' | 'dashboard') => void;
};

export default function AdminLayout({ children, activeMenu: initialActiveMenu = 'home', adminName = 'Administrador', onMenuChange }: AdminLayoutProps) {
  const { logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'home' | 'dashboard'>(initialActiveMenu);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuChange = (menu: 'home' | 'dashboard') => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
    onMenuChange?.(menu);
  };

  const handleLogout = async () => {
    toast.success('Logout realizado com sucesso!');
    await logout('/login');
  };

  const sidebarContent = (
    <>
      <div className="p-8 flex-1">
        <div className="mb-12 mt-4 flex items-center justify-between md:justify-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
            Painel do Administrador
          </h2>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
            className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-3">
          <SidebarLink
            icon={<Home size={22} />}
            label="Início (ONGs)"
            active={activeMenu === 'home'}
            onClick={() => handleMenuChange('home')}
          />
          <SidebarLink
            icon={<LayoutDashboard size={22} />}
            label="Métricas"
            active={activeMenu === 'dashboard'}
            onClick={() => handleMenuChange('dashboard')}
          />
        </nav>
      </div>

      <div className="p-8 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all rounded-xl text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={22} />
          <span className="text-lg tracking-tight">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-[#6B39A7] text-white flex-col shrink-0 shadow-2xl z-20">
        {sidebarContent}
      </aside>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#6B39A7] text-white flex flex-col shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Área Principal */}
      <main className="flex-1 flex flex-col bg-[#F8F9FA] overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 md:px-12 bg-[#F5F5F5] border-b border-gray-200 shrink-0 relative">
          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="md:ml-[-288px] flex items-center justify-center">
              <Image
                src="/logo_roxa.svg"
                alt="DoeCerto"
                width={150}
                height={50}
                priority
                className="object-contain pointer-events-auto"
              />
            </div>
          </div>

          <div className="flex-1 flex items-center z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
              className="md:hidden p-2 rounded-xl text-[#3b1c63] hover:bg-gray-200/70 transition-colors cursor-pointer"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Perfil do Administrador */}
          <div className="flex-1 flex items-center justify-end gap-5 z-10">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-bold text-[#3b1c63] hidden xl:block tracking-tight">
                {adminName}
              </span>
              <div className="w-9 h-9 bg-[#7c3aed] rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {activeMenu === 'home' ? children : <MetricsPanel />}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
      w-full flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all rounded-xl relative group
      ${active
        ? 'bg-white/10 text-white font-bold'
        : 'text-white/75 hover:bg-white/5 hover:text-white'}
    `}>
      {active && (
        <div className="absolute left-0 w-1.5 h-6 bg-[#FFF15F] rounded-r-full transition-all duration-300" />
      )}
      <span className="transition-transform group-hover:scale-105 duration-200">
        {icon}
      </span>
      <span className="text-lg tracking-tight">{label}</span>
    </button>
  );
}