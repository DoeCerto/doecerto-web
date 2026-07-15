"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { FiX, FiUser, FiLogOut, FiGlobe, FiHelpCircle } from "react-icons/fi";
import { Search, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { api } from "@/services/api";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { DonorService } from "@/services/donor.service";
import { motion } from "framer-motion";

type Ong = {
  id: number;
  name: string;
  img: string;
  distance?: string;
  rating?: number | string;
  categories: string[];
};

interface CatalogSection {
  title: string;
  type: string;
  items: any[];
}

const TAKE = 8;

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

export default function HomePage() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOng, setSelectedOng] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("/default-avatar.png");
  const [user, setUser] = useState<{ name?: string } | null>(null);

  const [recommendedOngs, setRecommendedOngs] = useState<Ong[]>([]);
  const [nearbyOngs, setNearbyOngs] = useState<Ong[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userRole = localStorage.getItem("userRole")?.toUpperCase();
        if (userRole !== "ONG") {
          const profile = await DonorService.getMyProfile();

          setUser(profile);

          // Verifica se faltam dados básicos
          const isIncomplete =
            profile.isNewProfile ||
            !profile.phone ||
            !profile.cpf ||
            profile.cpf.startsWith('PENDING');

// Dentro do useEffect do loadUserProfile na HomePage:

if (isIncomplete) {
  // router.push('/complete-register'); // COMENTE ESTA LINHA
  // return;                           // COMENTE ESTA LINHA TAMBÉM
  

  console.log("Perfil incompleto detectado, mas ignorando redirecionamento para demonstração.");
}

          if (profile?.avatarUrl) {
            setUserAvatar(OngsProfileService._formatImageUrl(profile.avatarUrl));
          }
        }
      } catch (err) {
        console.error("Erro ao verificar perfil:", err);
      }
    }
    loadUserProfile();
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const { data: catalog } = await api<CatalogSection[]>('/catalog');

        const recommendedSection = catalog.find((section) => section.type === 'topRated');
        const nearbySection = catalog.find((section) => section.type === 'nearby');

        if (recommendedSection) {
          setRecommendedOngs(recommendedSection.items.map((ong: any) => ({
            id: ong.id,
            name: ong.name,
            img: OngsProfileService._formatImageUrl(ong.avatarUrl),
            rating: ong.averageRating || 0.0,
            categories: ong.categories.map((c: any) => c.name),
          })));
        }

        if (nearbySection) {
          setNearbyOngs(nearbySection.items.map((ong: any) => ({
            id: ong.id,
            name: ong.name,
            img: OngsProfileService._formatImageUrl(ong.avatarUrl),
            distance: `${ong.distance} km`,
            categories: ong.categories.map((c: any) => c.name),
          })));
        }

        const allCats = catalog.flatMap(section =>
          section.items.flatMap(ong => ong.categories.map((c: any) => c.name))
        );
        const uniqueCats = Array.from(new Set(allCats)).sort();
        setAvailableCategories(uniqueCats);

      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      }
    }

    loadCatalog();
  }, [page]);

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

  function openDonateModal(ongId: number) {
    setSelectedOng(ongId);
    setIsModalOpen(true);
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

  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao deslogar no servidor:", error);
    } finally {
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem("access_token");
      setUserAvatar("/default-avatar.png");
      router.push("/login");
    }
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

      {/* HEADER PREMIUM */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <Image src="/logo_roxa.svg" alt="DoeCerto" width={140} height={140} priority className="object-contain" />

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-700"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.div>

            <span className="hidden sm:block flex-1 min-w-0 truncate text-purple-700 font-bold text-sm px-2">
              {user?.name || "Usuário"}
            </span>

            <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-100">
              {userAvatar && userAvatar !== "/default-avatar.png" ? (
                <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <FiUser size={18} className="text-purple-700" />
                </div>
              )}
            </div>
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
              <button onClick={goToProfile} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left">
                <FiUser size={18} className="text-blue-600" />
                <span className="font-bold text-slate-700">Meu Perfil</span>
              </button>
              <button
                onClick={() => {
                  router.push("/help-center");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left"
              >
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
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">

{/* Barra de Pesquisa */}
<div className="relative mb-8 w-full">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <Search className="h-5 w-5 text-slate-400" />
  </div>
  <input
    type="text"
    className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
    placeholder="Pesquise uma ONG, cidade ou causa..."
    value={query} // <-- ADICIONE ISSO
    onChange={(e) => setQuery(e.target.value)} // <-- ADICIONE ISSO
  />
  {query && (
    <button onClick={() => setQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
      <FiX size={20} />
    </button>
  )}
</div>

        {/* Filtros de Categoria */}
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

        {/* Indicador de Resultados */}
        {(query || selectedCategory) && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-500">
              {filteredRecommended.length} {filteredRecommended.length === 1 ? 'ONG encontrada' : 'ONGs encontradas'}
              {query && ` para "${query}"`}
              {selectedCategory && ` em ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Seção: ONGs Recomendadas */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">ONGs recomendadas</h2>

          {filteredRecommended.length === 0 ? (
            <div className="w-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
              <p className="text-slate-500 font-medium text-lg">Nenhuma ONG encontrada nesta categoria.</p>
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
                      {ong.categories.length > 1 && (
                        <span className="text-[11px] font-bold text-slate-400 self-center">+{ong.categories.length - 1}</span>
                      )}
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
                        openDonateModal(ong.id);
                      }}
                      className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3.5 font-bold transition-all shadow-sm active:scale-95"
                    >
                      Apoiar causa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção: Mais Próximas */}
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
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <p className="text-xs font-bold">{ong.distance}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDonateModal(ong.id);
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

        {/* Botão Carregar Mais */}
        <div className="flex justify-center pb-10 mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-600 hover:text-purple-700 rounded-2xl px-8 py-4 font-extrabold transition-colors shadow-sm active:scale-95"
          >
            Carregar mais ONGs
          </button>
        </div>

      </main>

      {/* MODAL DE DOAÇÃO */}
      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={goToDonateMoney}
          onDonateItems={goToDonateItems}
        />
      )}

      {/* MODAL DE PERFIL INCOMPLETO */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <FiUser size={40} className="text-purple-700" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              Complete seu Perfil
            </h2>

            <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
              Para realizar doações de forma segura no DoeCerto, precisamos que você finalize seu cadastro confirmando seus dados e adicionando um telefone de contato.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all"
              >
                Ir para meu Perfil
              </button>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Agora não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}