"use client";

import { Clock, CheckCircle, XCircle } from 'lucide-react';

type DashboardHomeProps = {
  onNavigate: (view: 'pending' | 'approved' | 'rejected' | 'restricted') => void;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    restricted: number;
  };
  adminName: string;
};

export default function DashboardHome({ onNavigate, stats, adminName }: DashboardHomeProps) {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-8">
      {/* Texto de Bem-vindo */}
      <div className="pt-24 pb-16 text-center md:text-left">
        <h1 className="text-5xl font-black text-[#6B39A7] tracking-tighter mb-4">
          Bem-Vindo, {adminName}
        </h1>
        <p className="text-[#6B39A7] text-xl font-bold max-w-2xl opacity-90">
          Gerencie as ONGs cadastradas e acompanhe o status de cada solicitação.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="pb-16 flex justify-center md:justify-start">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1400px]">
          <StatusCard
            title="ONGs Pendentes"
            count={stats.pending.toString()}
            label="Em Análise"
            icon={<Clock size={48} className="text-white" />}
            bgColor="bg-[#FFF15F]"
            innerColor="bg-[#FFC107]"
            btnColor="bg-[#FFC107]"
            onClick={() => onNavigate('pending')}
          />
          <StatusCard
            title="ONGs Aceitas"
            count={stats.approved.toString()}
            label="Aceitas"
            icon={<CheckCircle size={48} className="text-white" />}
            bgColor="bg-[#79E69B]"
            innerColor="bg-[#006400]"
            btnColor="bg-[#004d00]"
            onClick={() => onNavigate('approved')}
          />
          <StatusCard
            title="ONGs Recusadas"
            count={stats.rejected.toString()}
            label="Recusadas"
            icon={<XCircle size={48} className="text-white" />}
            bgColor="bg-[#F26470]"
            innerColor="bg-[#B30000]"
            btnColor="bg-[#990000]"
            onClick={() => onNavigate('rejected')}
          />
          <StatusCard
            title="ONGs Restritas"
            count={stats.restricted.toString()}
            label="Ação Exigida"
            icon={<XCircle size={48} className="text-white" />}
            bgColor="bg-gray-800"
            innerColor="bg-gray-900"
            btnColor="bg-black"
            onClick={() => onNavigate('restricted')}
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, count, label, icon, bgColor, innerColor, btnColor, onClick }: any) {
  return (
    <div className={`
      ${bgColor} rounded-[3rem] p-7 flex flex-col items-center 
      shadow-md transition-all duration-300 ease-out
      hover:scale-105 hover:shadow-xl cursor-default
    `}>
      <div className={`${innerColor} w-full rounded-[2.5rem] py-12 flex flex-col items-center mb-6 shadow-lg`}>
        <div className="mb-4">{icon}</div>
        <h3 className="text-white font-bold text-lg mb-2 text-center leading-tight">
          {title}
        </h3>
        <span className="text-white text-7xl font-black mb-2 tracking-tighter">{count}</span>
        <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>

      <button 
        onClick={onClick}
        className={`${btnColor} w-full py-4 rounded-full text-white font-black text-xs uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all`}
      >
        Ver Detalhes
      </button>
    </div>
  );
}