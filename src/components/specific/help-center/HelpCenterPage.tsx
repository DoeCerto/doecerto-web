import Link from "next/link";
import { 
  ArrowLeft, 
  Wallet, 
  Package, 
  History, 
  Star, 
  Search, 
  Heart, 
  User, 
  ShieldCheck, 
  ChevronRight,
  LifeBuoy
} from "lucide-react";

interface HelpCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
  bgClass: string;
}

function HelpCard({ title, description, icon, href, colorClass, bgClass }: HelpCardProps) {
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

// Como não usamos mais hooks (useRouter), essa página agora roda 100% no servidor!
export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-purple-600 selection:text-white">
      
      <header className="pt-16 pb-10 px-6 max-w-4xl mx-auto">
        {/* ✅ Substituímos o <button> por um <Link> nativo */}
        <Link 
          href="/home" 
          className="flex items-center text-slate-500 hover:text-purple-700 font-bold transition-colors group w-fit active:scale-95 cursor-pointer mb-12 text-lg"
        >
          <ArrowLeft size={24} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Voltar
        </Link>
        
        <div className="flex flex-col items-start">
          <div className="w-20 h-20 bg-purple-100 rounded-[1.8rem] flex items-center justify-center mb-8 shadow-sm border border-purple-50">
            <LifeBuoy className="text-purple-700" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Como podemos te ajudar?
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Escolha um tópico abaixo para encontrar as respostas que você precisa.
          </p>
        </div>
      </header>

      {/* Container mais largo e com mais espaçamento: max-w-4xl e space-y-14 */}
      <main className="max-w-4xl mx-auto px-6 space-y-14">
        
        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-5 ml-2">
            Guia de Doações
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <HelpCard 
              title="Como doar dinheiro" 
              description="Passo a passo para doações financeiras e Pix." 
              icon={<Wallet size={28} strokeWidth={2.5} />} 
              href="/donation-guide" 
              colorClass="text-emerald-600" 
              bgClass="bg-emerald-50" 
            />
            <HelpCard 
              title="Como doar itens" 
              description="Alimentos, ração, roupas e agendamento de entregas." 
              icon={<Package size={28} strokeWidth={2.5} />} 
              href="/donation-item-guide" 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50" 
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-5 ml-2">
            Histórico e Transparência
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <HelpCard 
              title="Histórico de doações" 
              description="Acompanhe todas as causas que você já apoiou." 
              icon={<History size={28} strokeWidth={2.5} />} 
              href="/donation-history-guide" 
              colorClass="text-purple-600" 
              bgClass="bg-purple-50" 
            />
            <HelpCard 
              title="Avaliar uma ONG" 
              description="Deixe comentários e ajude a comunidade." 
              icon={<Star size={28} strokeWidth={2.5} />} 
              href="/rating-guide" 
              colorClass="text-yellow-600" 
              bgClass="bg-yellow-50" 
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-5 ml-2">
            Plataforma e Causas
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <HelpCard 
              title="Buscar e filtrar ONGs" 
              description="Encontre a instituição ideal perto de você." 
              icon={<Search size={28} strokeWidth={2.5} />} 
              href="/home" 
              colorClass="text-indigo-600" 
              bgClass="bg-indigo-50" 
            />
            <HelpCard 
              title="Minhas favoritas" 
              description="Gerencie as causas que você mais ama." 
              icon={<Heart size={28} strokeWidth={2.5} />} 
              href="/dashboard" 
              colorClass="text-rose-600" 
              bgClass="bg-rose-50" 
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-5 ml-2">
            Sua Conta
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <HelpCard 
              title="Gerenciar perfil" 
              description="Altere sua foto, nome, endereço e contatos." 
              icon={<User size={28} strokeWidth={2.5} />} 
              href="/dashboard" 
              colorClass="text-slate-600" 
              bgClass="bg-slate-100" 
            />
            <HelpCard 
              title="Segurança e Privacidade" 
              description="Leia nossos termos e veja como protegemos seus dados." 
              icon={<ShieldCheck size={28} strokeWidth={2.5} />} 
              href="/terms" 
              colorClass="text-orange-600" 
              bgClass="bg-orange-50" 
            />
          </div>
        </section>

      </main>
    </div>
  );
}