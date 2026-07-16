"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiUser,
  FiLogOut,
  FiGlobe,
  FiHelpCircle,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { api } from "@/services/api";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { DonorService } from "@/services/donor.service";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

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

function OngLogo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`${className} bg-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1`}
      >
        <FiGlobe size={24} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          ONG
        </span>
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
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCompleteRegistration = async () => {
    const rawPhone = phone.replace(/\D/g, "");

    if (rawPhone.length < 10) {
      toast.error("Por favor, informe um número válido.");
      return;
    }

    try {
      setIsSaving(true);

      await DonorService.updateProfile({ contactNumber: `55${rawPhone}` });

      toast.success("Telefone cadastrado com sucesso!");
      setIsProfileIncomplete(false);
      setShowProfileModal(false);
      
      if (selectedOng) {
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error("Erro ao salvar telefone. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userRole = localStorage.getItem("userRole")?.toUpperCase();
        if (userRole !== "ONG") {
          const profile = await DonorService.getMyProfile();

          setUser(profile);

          const isIncomplete = profile.isNewProfile || !profile.phone;
          setIsProfileIncomplete(isIncomplete);

          if (profile?.avatarUrl) {
            setUserAvatar(
              OngsProfileService._formatImageUrl(profile.avatarUrl),
            );
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
        const { data: catalog } = await api<CatalogSection[]>("/catalog");

        const recommendedSection = catalog.find(
          (section) => section.type === "topRated",
        );
        const nearbySection = catalog.find(
          (section) => section.type === "nearby",
        );

        if (recommendedSection) {
          setRecommendedOngs(
            recommendedSection.items.map((ong: any) => ({
              id: ong.id,
              name: ong.name,
              img: OngsProfileService._formatImageUrl(ong.avatarUrl),
              rating: ong.averageRating || 0.0,
              categories: ong.categories.map((c: any) => c.name),
            })),
          );
        }

        if (nearbySection) {
          setNearbyOngs(
            nearbySection.items.map((ong: any) => ({
              id: ong.id,
              name: ong.name,
              img: OngsProfileService._formatImageUrl(ong.avatarUrl),
              distance: `${ong.distance} km`,
              categories: ong.categories.map((c: any) => c.name),
            })),
          );
        }

        const allCats = catalog.flatMap((section) =>
          section.items.flatMap((ong) =>
            ong.categories.map((c: any) => c.name),
          ),
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
    const matchesSearch =
      query === "" || ong.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === null || ong.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredNearby = nearbyOngs.filter((ong) => {
    const matchesSearch =
      query === "" || ong.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === null || ong.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  function openDonateModal(ongId: number) {
    setSelectedOng(ongId);

    if (isProfileIncomplete) {
      setShowProfileModal(true);
    } else {
      setIsModalOpen(true);
    }
  }

  function goToDonateItems() {
    if (!selectedOng) return;

    const allOngs = [...recommendedOngs, ...nearbyOngs];
    const ong = allOngs.find((o) => o.id === selectedOng);
    if (!ong) return;
    router.push(
      `/donation?ongId=${selectedOng}&ong=${encodeURIComponent(ong.name)}`,
    );
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
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear();
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
    <div className="min-h-screen bg-gray-50 text-gray-900 w-full overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Container wrapper para manter o layout centralizado e alinhado em telas maiores */}
      <div className="max-w-7xl mx-auto w-full">
        
        <header className="px-5 pt-6 pb-4 flex items-center justify-between">
          <Image
            src="/logo_roxa.svg"
            alt="DoeCerto"
            width={120}
            height={120}
            priority
          />

          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 min-[340px]:gap-2 bg-white px-2 py-1.5 min-[340px]:px-3 min-[340px]:py-2 rounded-full shadow-md border border-gray-100 hover:shadow-lg transition-all active:scale-95 max-w-[130px] min-[340px]:max-w-[190px]"
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
                  className="text-[#6B21A8] min-[340px]:w-[18px] min-[340px]:h-[18px]"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>

              <span className="hidden min-[370px]:block flex-1 min-w-0 truncate text-[#6B21A8] font-semibold text-sm">
                {user?.name || "Usuário"}
              </span>

              <div className="w-8 h-8 min-[340px]:w-10 min-[340px]:h-10 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-100">
                {userAvatar && userAvatar !== "/default-avatar.png" ? (
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#EBD2FF] to-[#D6B4FF] flex items-center justify-center">
                    <FiUser
                      size={16}
                      className="text-[#6B21A8] min-[340px]:size-[18px]"
                    />
                  </div>
                )}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <FiUser size={18} className="text-blue-600" />
                  <span className="font-medium text-gray-700">Meu Perfil</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left"
                >
                  <FiLogOut size={18} className="text-red-600" />
                  <span className="font-medium text-gray-700">Sair</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="px-5">
          <div className="flex items-center gap-3 bg-white shadow-sm rounded-xl px-3 py-2 border border-transparent focus-within:border-purple-200 transition-all">
            <FiSearch className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquise uma ONG, cidade ou causa"
              className="w-full outline-none text-base bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 px-5">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 w-full">
            {availableCategories.map((c, i) => {
              const isSelected = selectedCategory === c;
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={() => setSelectedCategory(isSelected ? null : c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full border text-base shadow-sm transition-colors ${
                    isSelected
                      ? "border-purple-700 bg-purple-100 text-purple-800"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </div>

        {(query || selectedCategory) && (
          <div className="px-5 mt-3">
            <p className="text-sm text-gray-600">
              {filteredRecommended.length}{" "}
              {filteredRecommended.length === 1
                ? "ONG encontrada"
                : "ONGs encontradas"}
              {query && ` para "${query}"`}
              {selectedCategory && ` em ${selectedCategory}`}
            </p>
          </div>
        )}

        <section className="mt-5 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              ONGs recomendadas
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar w-full">
            {filteredRecommended.length === 0 ? (
              <div className="w-full text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                Nenhuma ONG encontrada
              </div>
            ) : (
              filteredRecommended.map((ong) => (
                <div
                  key={`carousel-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="min-w-[220px] max-w-[220px] bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                >
                  <div>
                    <OngLogo
                      src={ong.img}
                      alt={ong.name}
                      className="w-full h-[170px]"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold truncate">{ong.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ong.categories.slice(0, 1).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-100 text-xs font-bold rounded-full truncate max-w-[140px]"
                          >
                            {cat}
                          </span>
                        ))}
                        {ong.categories.length > 1 && (
                          <span className="text-[10px] text-gray-400 font-medium self-center">
                            +{ong.categories.length - 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 mt-2">
                        <FaStar size={12} />
                        <span className="text-xs font-semibold text-gray-700">
                          {ong.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "#551A8B" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDonateModal(ong.id);
                      }}
                      className="w-full bg-[#6B21A8] text-white py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                    >
                      Doar
                    </motion.button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 px-5 mb-10 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Mais próximas de você
          </h2>
          {filteredNearby.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-gray-600 text-lg">Nenhuma ONG encontrada</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {filteredNearby.map((ong) => (
                <div
                  key={`list-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 w-full justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <OngLogo
                        src={ong.img}
                        alt={ong.name}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate text-gray-800">{ong.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ong.categories.slice(0, 2).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-100 text-xs font-bold rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                        {ong.categories.length > 2 && (
                          <span className="text-[10px] text-gray-400 font-medium self-center">
                            +{ong.categories.length - 2}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{ong.distance}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#551A8B" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDonateModal(ong.id);
                    }}
                    className="bg-[#6B21A8] text-white px-4 py-2 rounded-lg text-sm font-semibold shrink-0 shadow-sm transition-colors"
                  >
                    Doar
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="px-5 pb-10">
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: "#F3E8FF" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setPage((p) => p + 1)}
            className="w-full bg-white border border-purple-100 rounded-xl py-3 shadow-sm text-purple-700 font-semibold transition-colors"
          >
            Carregar mais ONGs
          </motion.button>
        </div>

      </div>

      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={goToDonateMoney}
          onDonateItems={goToDonateItems}
        />
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={() => setShowProfileModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 flex flex-col items-center text-center animate-scaleIn z-10">
            
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            >
              <FiX size={24} />
            </button>

            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-8 border border-purple-100/50">
              <FiUser size={44} className="text-[#6B39A7]" />
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              Só mais um detalhe!
            </h2>

            <p className="text-gray-600 text-sm min-[380px]:text-base mb-10 leading-relaxed font-medium">
              Para prosseguir com sua doação, precisamos de um telefone de contato. 
              <span className="block mt-2 text-[#6B39A7] font-semibold">
                É através dele que a ONG poderá alinhar a entrega das doações, enviar atualizações e prestar contas sobre o impacto do seu apoio.
              </span>
            </p>

            <div className="w-full space-y-6">
              <div className="relative flex items-center w-full">
                <div className="absolute left-4 text-[#6B39A7] font-bold text-lg bg-purple-50 px-2 py-1 rounded-lg">
                  +55
                </div>

                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full pl-20 pr-4 py-5 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B39A7] transition-all text-gray-800 font-medium"
                  value={phone} 
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setPhone(numericValue);
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#55278d" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteRegistration} 
                  disabled={isSaving} 
                  className="w-full bg-[#6B39A7] text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-100 transition-all text-lg disabled:opacity-70 cursor-pointer"
                >
                  {isSaving ? "Salvando..." : "Salvar e Continuar"}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#F9FAFB" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-transparent text-gray-500 font-semibold py-3 rounded-2xl transition-all text-sm cursor-pointer"
                >
                  Talvez mais tarde
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}