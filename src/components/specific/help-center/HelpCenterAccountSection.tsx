"use client";

import Link from "next/link";
import { User, ShieldCheck, Lock, BarChart3, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AccountHelpCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
  bgClass: string;
}

function AccountHelpCard({ title, description, icon, href, colorClass, bgClass }: AccountHelpCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-5 p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 active:scale-[0.98] cursor-pointer"
    >
      <div className={`p-4 rounded-2xl shrink-0 ${bgClass} ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 group-hover:text-purple-700 transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-base text-slate-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>
      <div className="py-2 pl-2">
        <ChevronRight size={24} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </Link>
  );
}

export function HelpCenterAccountSection() {
  const { userRole } = useAuth();
  const roleLower = userRole?.toLowerCase();

  const profileHref =
    roleLower === "ong"
      ? "/ong-profilesetup"
      : roleLower === "admin"
        ? "/adm-dashboard"
        : "/dashboard";

  const profileDescription =
    roleLower === "ong"
      ? "Edite os dados públicos, fotos e informações da sua ONG."
      : roleLower === "admin"
        ? "Acesse o painel administrativo e a auditoria de ONGs."
        : "Altere sua foto, nome, endereço e contatos.";

  return (
    <section>
      <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-5 ml-2">
        Sua Conta e Segurança
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        <AccountHelpCard
          title="Gerenciar perfil"
          description={profileDescription}
          icon={<User size={28} strokeWidth={2.5} />}
          href={profileHref}
          colorClass="text-slate-600"
          bgClass="bg-slate-100"
        />
        <AccountHelpCard
          title="Termos de Uso"
          description="Consulte as regras da plataforma, repasses e responsabilidades."
          icon={<ShieldCheck size={28} strokeWidth={2.5} />}
          href="/terms"
          colorClass="text-orange-600"
          bgClass="bg-orange-50"
        />
        <AccountHelpCard
          title="Política de Privacidade"
          description="Entenda como protegemos seus dados e seus direitos na LGPD."
          icon={<Lock size={28} strokeWidth={2.5} />}
          href="/privacy"
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <AccountHelpCard
          title="Metodologia e Auditoria"
          description="Veja como validamos ONGs na CGU e calculamos o impacto."
          icon={<BarChart3 size={28} strokeWidth={2.5} />}
          href="/metodologia"
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
      </div>
    </section>
  );
}

