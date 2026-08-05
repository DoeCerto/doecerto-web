"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiX, FiUser, FiLogOut, FiGlobe, FiHelpCircle } from "react-icons/fi";
import { Search, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { Preferences } from "@capacitor/preferences";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { motion } from "framer-motion";
import { DonorService } from "@/services/donor.service";
import { useAuth } from "@/contexts/AuthContext";

type Ong = {
  id: number;
  name: string;
  img: string;
  distance?: string;
  rating?: number | string;
  categories: string[];
};

function OngLogo({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1`}>
        <FiGlobe size={24} className="opacity-50" />
        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">ONG</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-cover`}
      onError={() => setError(true)}
    />
  );
}



export default function HomeClient({
  initialCatalog,
  initialIsAuthenticated,
  initialUserName,
  initialUserAvatar,
  initialUserRole,
}: {
  initialCatalog: any[];
  initialIsAuthenticated: boolean;
  initialUserName?: string | null;
  initialUserAvatar?: string | null;
  initialUserRole?: string | null;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 1. Consome o contexto global (para o avatar e updates de sessão)
  const { isAuthenticated: contextIsAuth, userName: contextName, userAvatar: contextAvatar, refreshSession } = useAuth();

  // 2. PRIORIDADE DO CASO 2:
  // - O status de autenticação vem preferencialmente do Cookie via SSR (servidor) ou do Contexto.
  // - O nome vem direto do JWT decodificado no servidor (zero-flicker).
  const isAuth = initialIsAuthenticated || contextIsAuth;
  const displayName = initialUserName || contextName || "Usuário";

  // - O avatar vem do localStorage através do Contexto Global (ou do avatar inicial se houver)
  const rawAvatar = contextAvatar || initialUserAvatar;
  const displayAvatar = rawAvatar
    ? OngsProfileService._formatImageUrl(rawAvatar)
    : "/default-avatar.png";

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOng, setSelectedOng] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUserAvatar() {
      // Usa o isAuth (prioridade do servidor + contexto)
      if (!isAuth) return;

      try {
        const userRole = localStorage.getItem("userRole")?.toUpperCase();
        if (userRole !== "ONG") {
          const profile = await DonorService.getMyProfile();
          if (profile?.avatarUrl) {
            localStorage.setItem("userAvatar", profile.avatarUrl);
            // Atualiza o contexto global com a foto nova sem recarregar a página
            refreshSession();
          }
        }
      } catch (err) {
        console.error("Erro ao carregar o avatar do usuário:", err);
      }
    }

    loadUserAvatar();
  }, [isAuth, refreshSession]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMenuOpen(false);

    try {
      await Preferences.remove({ key: "access_token" });
      await Preferences.remove({ key: "userRole" });
    } catch (e) { }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userName");
    localStorage.removeItem("registration_completed");

    // Notifica o Contexto Global que a sessão encerrou
    refreshSession();

    router.refresh();
  }

  const [recommendedOngs] = useState<Ong[]>(() => {
    const section = initialCatalog?.find((s) => s.type === 'topRated');
    if (!section) return [];
    return section.items.map((ong: any) => ({
      id: ong.id,
      name: ong.name,
      img: OngsProfileService._formatImageUrl(ong.avatarUrl),
      rating: ong.averageRating || 0.0,
      categories: ong.categories.map((c: any) => c.name),
    }));
  });

  const [nearbyOngs] = useState<Ong[]>(() => {
    const section = initialCatalog?.find((s) => s.type === 'nearby');
    if (!section) return [];
    return section.items.map((ong: any) => ({
      id: ong.id,
      name: ong.name,
      img: OngsProfileService._formatImageUrl(ong.avatarUrl),
      distance: `${ong.distance || 0} km`,
      categories: ong.categories.map((c: any) => c.name),
    }));
  });

  const [availableCategories] = useState<string[]>(() => {
    const allCats = initialCatalog?.flatMap(section =>
      section.items.flatMap((ong: any) => ong.categories.map((c: any) => c.name))
    ) || [];
    return Array.from(new Set(allCats)).sort();
  });

  const [showGuestDonateModal, setShowGuestDonateModal] = useState(false);

  const filteredRecommended = recommendedOngs.filter((ong) => {
    const matchesSearch = query === "" || ong.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === null || ong.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredNearby = nearbyOngs.filter((ong) => {
    const matchesSearch = query === "" || ong.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === null || ong.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  function handleDonateClick(ongId: number) {
    setSelectedOng(ongId);
    if (!isAuth) {
      setShowGuestDonateModal(true);
    } else {
      setIsModalOpen(true);
    }
  }

  function goToDonateItems() {
    if (!selectedOng) return;
    const allOngs = [...recommendedOngs, ...nearbyOngs];
    const ong = allOngs.find((o) => o.id === selectedOng);
    if (!ong) return;
    router.push(`/donation?ongId=${selectedOng}&ong=${encodeURIComponent(ong.name)}`);
  }

  function goToDonateMoney() {
    if (!selectedOng) return;
    setIsModalOpen(false);
    router.push(`/pix?id=${selectedOng}`);
  }

  function goToProfile() {
    const userRole = localStorage.getItem("userRole") || "";
    if (userRole.toUpperCase() === "ONG") {
      router.push("/ong-dashboard");
    } else {
      router.push("/dashboard");
    }
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="nav-anim">
          <button
            onClick={() => window.location.reload()}
            className="inline-block cursor-pointer"
          >
            <img src="/logo-roxa.svg" alt="DoeCerto" className="h-8 object-contain" />
          </button>
        </div>

        {isAuth ? (
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md transition-all active:scale-95"
            >
              <motion.div
                className="shrink-0"
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>

              <span className="hidden sm:block flex-1 min-w-0 truncate text-purple-700 font-bold text-sm px-2">
                {displayName}
              </span>

              <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-100">
                {displayAvatar && displayAvatar !== "/default-avatar.png" ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <FiUser size={18} className="text-purple-700" />
                  </div>
                )}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                <button onClick={goToProfile} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left">
                  <FiUser size={18} className="text-blue-600" />
                  <span className="font-bold text-slate-700">Meu Perfil</span>
                </button>
                <button onClick={() => { router.push("/help-center"); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left">
                  <FiHelpCircle size={18} className="text-purple-600" />
                  <span className="font-bold text-slate-700">Central de Ajuda</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition text-left">
                  <FiLogOut size={18} className="text-red-600" />
                  <span className="font-bold text-red-600">Sair</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* APENAS FADE PURO (OPACIDADE) */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              Entrar
            </button>

            <button
              onClick={() => router.push('/register')}
              className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95"
            >
              Criar conta
            </button>
          </motion.div>
        )}
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">

        <div className="relative mb-8 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            placeholder="Pesquise uma ONG, cidade ou causa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {availableCategories.map((c, i) => {
            const isSelected = selectedCategory === c;
            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(isSelected ? null : c)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${isSelected
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200 border border-transparent"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                  }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* ONGs Recomendadas */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">ONGs recomendadas</h2>
          {filteredRecommended.length === 0 ? (
            <div className="w-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
              <p className="text-slate-500 font-medium text-lg">Nenhuma ONG encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecommended.map((ong) => (
                <div
                  key={`recommended-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="group flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <OngLogo src={ong.img} alt={ong.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-extrabold text-slate-700">{ong.rating}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ong.categories.slice(0, 1).map((cat, idx) => (
                        <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase truncate max-w-[160px]">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-3 line-clamp-2">
                      {ong.name}
                    </h3>

                    {ong.distance && (
                      <div className="flex items-center gap-1.5 text-slate-500 mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-semibold">{ong.distance}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonateClick(ong.id);
                      }}
                      className="mt-auto w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3.5 font-bold transition-all shadow-sm active:scale-95"
                    >
                      Apoiar causa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ONGs Próximas */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">Mais próximas de você</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredNearby.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                <p className="text-slate-500 font-medium text-lg">Nenhuma ONG próxima encontrada.</p>
              </div>
            ) : (
              filteredNearby.map((ong) => (
                <div
                  key={`nearby-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="flex items-center gap-5 bg-white border border-slate-200 rounded-3xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                    <OngLogo src={ong.img} alt={ong.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 truncate mb-2">{ong.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ong.categories.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDonateClick(ong.id);
                    }}
                    className="bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white px-5 py-3 rounded-xl text-sm font-bold shrink-0 transition-all duration-300 active:scale-95 hidden sm:block"
                  >
                    Doar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {showGuestDonateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuestDonateModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <FiUser size={32} className="text-purple-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Fazer o bem faz bem!</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
              Você pode criar uma conta para acompanhar o impacto das suas doações, ou seguir de forma anônima.
            </p>
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => router.push("/register")}
                className="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all"
              >
                Criar Conta / Entrar
              </button>
              <button
                onClick={() => {
                  setShowGuestDonateModal(false);
                  setIsModalOpen(true);
                }}
                className="w-full py-3.5 text-purple-600 border-2 border-purple-100 font-bold rounded-xl hover:bg-purple-50 active:scale-95 transition-all"
              >
                Doar Anonimamente
              </button>
              <button onClick={() => setShowGuestDonateModal(false)} className="mt-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={goToDonateMoney}
          onDonateItems={goToDonateItems}
        />
      )}
    </div>
  );
}