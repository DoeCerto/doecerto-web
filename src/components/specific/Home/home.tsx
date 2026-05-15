"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiGlobe, FiHelpCircle, } from "react-icons/fi";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
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
      <div className={`${className} bg-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1`}>
        <FiGlobe size={24} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">ONG</span>
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
  const [userAvatar, setUserAvatar] = useState<string>("https://placehold.co/80x80/ddd/aaa.png");
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
          const isIncomplete = !profile.name || profile.name === "Doador" || !profile.phone;

          if (isIncomplete) {
            setShowProfileModal(true);
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
      setUserAvatar("https://placehold.co/80x80/ddd/aaa.png");
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Image src="/logo_roxa.svg" alt="DoeCerto" width={120} height={120} priority />

        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {/* Removido o botão de hambúrguer daqui */}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md border border-gray-100 hover:shadow-lg transition-all active:scale-95 max-w-[190px]"
          >
            {/* seta */}
            <motion.div
              className="shrink-0"
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#6B21A8]"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.div>

            {/* nome */}
            <span className="flex-1 min-w-0 truncate text-[#6B21A8] font-semibold text-sm">
              {user?.name || "Usuário"}
            </span>

            {/* avatar */}
            <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 overflow-hidden ring-2 ring-purple-100">
              <img
                src={userAvatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* O menu dropdown continua funcionando ao clicar na imagem */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">

              <button
                onClick={goToProfile}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <FiUser size={18} className="text-blue-600" />
                <span className="font-medium text-gray-700">Meu Perfil</span>
              </button>

              <button
                onClick={() => {
                  router.push("/help-center");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <FiHelpCircle size={18} className="text-purple-600" />
                <span className="font-medium text-gray-700">Central de Ajuda</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left"
              >
                <FiLogOut size={18} className="text-red-600" />
                <span className="font-medium text-red-600">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="px-5">
        <div className="flex items-center gap-3 bg-white shadow-sm rounded-xl px-3 py-2">
          <FiSearch className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise uma ONG, cidade ou causa"
            className="w-full outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <FiX />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 px-5">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {availableCategories.map((c, i) => {
            const isSelected = selectedCategory === c;
            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(isSelected ? null : c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-base shadow-sm active:scale-95 transition ${isSelected
                  ? "border-purple-700 bg-purple-100 text-purple-800"
                  : "border-gray-200 bg-white text-gray-700"
                  }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {(query || selectedCategory) && (
        <div className="px-5 mt-3">
          <p className="text-sm text-gray-600">
            {filteredRecommended.length} {filteredRecommended.length === 1 ? 'ONG encontrada' : 'ONGs encontradas'}
            {query && ` para "${query}"`}
            {selectedCategory && ` em ${selectedCategory}`}
          </p>
        </div>
      )}

      <section className="mt-5 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">ONGs recomendadas</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
          {filteredRecommended.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">Nenhuma ONG encontrada</div>
          ) : (
            filteredRecommended.map((ong) => (
              <div
                key={`carousel-${ong.id}`}
                onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                className="min-w-[220px] bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
              >
                <OngLogo src={ong.img} alt={ong.name} className="w-full h-[170px]" />
                <div className="p-3">
                  <h3 className="text-sm font-semibold truncate">{ong.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">

                    {ong.categories.slice(0, 1).map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-bold rounded-full truncate max-w-[120px]">
                        {cat}
                      </span>
                    ))}
                    {ong.categories.length > 1 && (
                      <span className="text-[10px] text-gray-400 font-medium self-center">+{ong.categories.length - 1}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 mt-2">
                    <FaStar size={12} />
                    <span className="text-xs font-semibold text-gray-700">
                      {ong.rating}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDonateModal(ong.id);
                    }}
                    className="mt-3 w-full bg-[#6B21A8] text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-800 transition"
                  >
                    Doar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 px-5 mb-10 space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Mais próximas de você</h2>
        {filteredNearby.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg">Nenhuma ONG encontrada</p>
          </div>
        ) : (
          filteredNearby.map((ong) => (
            <div
              key={`list-${ong.id}`}
              onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
              className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <OngLogo src={ong.img} alt={ong.name} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{ong.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">

                  {ong.categories.slice(0, 2).map((cat, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-bold rounded-full">
                      {cat}
                    </span>
                  ))}
                  {ong.categories.length > 2 && (
                    <span className="text-[10px] text-gray-400 font-medium self-center">+{ong.categories.length - 2}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{ong.distance}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDonateModal(ong.id);
                }}
                className="bg-[#6B21A8] text-white px-4 py-2 rounded-lg text-sm font-semibold shrink-0 shadow-sm"
              >
                Doar
              </button>
            </div>
          ))
        )}
      </section>

      <div className="px-5 pb-10">
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full bg-white border border-purple-100 rounded-xl py-3 shadow-sm text-purple-700 font-semibold active:bg-purple-50 transition"
        >
          Carregar mais ONGs
        </button>
      </div>

      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={goToDonateMoney}
          onDonateItems={goToDonateItems}
        />
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          {/* Overlay Escuro (Fundo) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card do Modal */}
          <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center animate-scaleIn">

            {/* Ícone de Perfil/User */}
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <FiUser size={40} className="text-[#6B21A8]" />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Complete seu Perfil
            </h2>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Para realizar doações no **DoeCerto**, precisamos que você finalize seu cadastro com telefone e foto.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-[#6B21A8] text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 active:scale-95 transition-all"
              >
                Ir para meu Perfil
              </button>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
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