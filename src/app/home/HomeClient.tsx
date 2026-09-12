"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search, MapPin, Star, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, FileText, Menu,
  Info, Layers, Heart, ShieldCheck, Handshake, MessageCircle
} from "lucide-react";
import { FiGlobe, FiUser, FiHelpCircle, FiLogOut, FiX, FiHeart } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { Preferences } from "@capacitor/preferences";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { motion, AnimatePresence } from "framer-motion";
import { DonorService } from "@/services/donor.service";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useAuth } from "@/contexts/AuthContext";

type Ong = {
  id: number;
  name: string;
  img: string;
  distance: string | null;
  rawDistance: number;
  rating: string;
  rawRating: number;
  categories: string[];
};

export function formatDistance(distanceInKm: number | string | null | undefined): string | null {
  if (distanceInKm === null || distanceInKm === undefined) return null;

  const numDistance = typeof distanceInKm === 'string' ? parseFloat(distanceInKm) : distanceInKm;
  if (isNaN(numDistance)) return null;

  if (numDistance < 1) {
    const meters = Math.round(numDistance * 1000);
    return `${meters} m`;
  }

  return `${numDistance.toFixed(1).replace('.', ',')} km`;
}

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

  return <img src={src} alt={alt} className={`${className} object-cover`} onError={() => setError(true)} />;
}

export default function HomeClient({
  initialCatalog,
  initialIsAuthenticated,
  initialUserName,
  initialUserAvatar,
}: {
  initialCatalog: any[];
  initialIsAuthenticated: boolean;
  initialUserName?: string | null;
  initialUserAvatar?: string | null;
  initialUserRole?: string | null;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated: contextIsAuth, userName: contextName, userAvatar: contextAvatar, refreshSession } = useAuth();
  const [isAuth, setIsAuth] = useState(initialIsAuthenticated);

  // DESLIGA SCROLL RESTORATION NA HOME PARA VOLTAR SEMPRE NO TOPO
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setIsAuth(contextIsAuth);
  }, [contextIsAuth]);

  const displayName = isAuth ? (contextName || initialUserName || "Usuário") : null;
  const rawAvatar = isAuth ? (contextAvatar || initialUserAvatar) : null;
  const displayAvatar = rawAvatar ? OngsProfileService._formatImageUrl(rawAvatar) : null;

  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'distance'>('default');

  const [selectedOng, setSelectedOng] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [guestModal, setGuestModal] = useState<{ isOpen: boolean; type: 'donate' | 'location' }>({ isOpen: false, type: 'donate' });

  const [premiumOngs, setPremiumOngs] = useState<Ong[]>(() => {
    const section = initialCatalog?.find((s) => s.type === 'topRated');
    if (!section) return [];
    return section.items.map((ong: any) => ({
      id: ong.id,
      name: ong.name,
      img: OngsProfileService._formatImageUrl(ong.avatarUrl),
      distance: formatDistance(ong.distance),
      rawDistance: ong.distance ? parseFloat(ong.distance) : Infinity,
      rating: (parseFloat(ong.averageRating) || 0).toFixed(1),
      rawRating: parseFloat(ong.averageRating) || 0,
      categories: ong.categories?.map((c: any) => c.name) || [],
    }));
  });

  const [allOngs, setAllOngs] = useState<Ong[]>(() => {
    const allItems = initialCatalog?.flatMap(section => section.items) || [];
    const uniqueMap = new Map();

    allItems.forEach((item: any) => {
      const existing = uniqueMap.get(item.id);
      if (!existing) {
        uniqueMap.set(item.id, item);
      } else {
        const currentRating = parseFloat(existing.averageRating) || 0;
        const newRating = parseFloat(item.averageRating) || 0;
        if (newRating > currentRating) {
          existing.averageRating = item.averageRating;
        }
      }
    });

    return Array.from(uniqueMap.values()).map((ong: any) => ({
      id: ong.id,
      name: ong.name,
      img: OngsProfileService._formatImageUrl(ong.avatarUrl),
      distance: formatDistance(ong.distance),
      rawDistance: ong.distance ? parseFloat(ong.distance) : Infinity,
      rating: (parseFloat(ong.averageRating) || 0).toFixed(1),
      rawRating: parseFloat(ong.averageRating) || 0,
      categories: ong.categories?.map((c: any) => c.name) || [],
    }));
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUserDataAndNearby() {
      if (!isAuth) return;

      try {
        const userRole = localStorage.getItem("userRole")?.toUpperCase();
        if (userRole !== "ONG") {
          const profile = await DonorService.getMyProfile().catch(() => null);

          if (!isMounted) return;

          if (!profile) {
            console.debug("Sessão expirada no servidor. Encerrando sessão local...");
            localStorage.clear();
            refreshSession();
            return;
          }

          if (profile?.avatarUrl) {
            localStorage.setItem("userAvatar", profile.avatarUrl);
            refreshSession();
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const nearbyRes = await fetch(`${apiUrl}/ongs/nearby`, {
            credentials: "include"
          });

          if (!isMounted) return;

          if (nearbyRes.ok) {
            const nearbyData = await nearbyRes.json();

            if (nearbyData?.data) {
              const applyDistances = (list: Ong[]) => {
                return list.map(ong => {
                  const found = nearbyData.data.find((n: any) => n.id === ong.id);
                  if (found) {
                    return {
                      ...ong,
                      distance: formatDistance(found.distance),
                      rawDistance: parseFloat(found.distance)
                    };
                  }
                  return ong;
                });
              };

              setPremiumOngs(prev => applyDistances(prev));

              setAllOngs(prev => {
                const updatedList = applyDistances(prev);

                const newItems = nearbyData.data
                  .filter((n: any) => !updatedList.some(o => o.id === n.id))
                  .map((n: any) => ({
                    id: n.id,
                    name: n.name,
                    img: OngsProfileService._formatImageUrl(n.avatarUrl),
                    distance: formatDistance(n.distance),
                    rawDistance: parseFloat(n.distance),
                    rating: (n.averageRating || 0).toFixed(1),
                    rawRating: parseFloat(n.averageRating) || 0,
                    categories: [],
                  }));

                return [...updatedList, ...newItems];
              });
            }
          }
        }
      } catch (err) {
        if (isMounted) console.debug("Erro ao carregar dados complementares:", err);
      }
    }

    fetchUserDataAndNearby();

    return () => {
      isMounted = false;
    };
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
    } catch (e) { }

    localStorage.removeItem("access_token");
    localStorage.removeItem("CapacitorStorage.access_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userName");
    localStorage.removeItem("registration_completed");

    refreshSession();
    router.refresh();
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const availableCategories = Array.from(new Set(allOngs.flatMap((ong) => ong.categories))).sort();
  const hasActiveFilters = activeCategories.length > 0 || sortBy !== 'default' || query !== "";

  const filteredCatalog = allOngs.filter((ong) => {
    const matchesSearch = query === "" || ong.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategories.length === 0 || activeCategories.some(c => ong.categories.includes(c));
    const matchesDistance = sortBy !== 'distance' || ong.rawDistance !== Infinity;

    return matchesSearch && matchesCategory && matchesDistance;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rawRating - a.rawRating;
    if (sortBy === 'distance') return a.rawDistance - b.rawDistance;
    return a.name.localeCompare(b.name);
  });

  function toggleCategory(cat: string) {
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function clearFilters() {
    setActiveCategories([]);
    setSortBy('default');
    setQuery("");
  }

  function handleDistanceFilterClick() {
    if (!isAuth) {
      setGuestModal({ isOpen: true, type: 'location' });
      return;
    }
    setSortBy(sortBy === 'distance' ? 'default' : 'distance');
  }

  function handleDonateClick(ongId: number) {
    setSelectedOng(ongId);
    if (!isAuth) {
      setGuestModal({ isOpen: true, type: 'donate' });
    } else {
      setIsModalOpen(true);
    }
  }

  function goToDonateItems() {
    if (!selectedOng) return;
    const all = Array.from(new Map([...premiumOngs, ...allOngs].map(o => [o.id, o])).values());
    const ong = all.find((o) => o.id === selectedOng);
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

  function goToDonations() {
    const userRole = localStorage.getItem("userRole") || "";
    if (userRole.toUpperCase() === "ONG") {
      router.push("/ong-dashboard?tab=history");
    } else {
      router.push("/dashboard?tab=history");
    }
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">

      {/* 
        HEADER RESPONSIVO
        Desktop: 3 colunas iguais (w-1/3) para garantir alinhamento perfeito do centro.
      */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-50">

        {/* LADO ESQUERDO (w-1/3 no Desktop) */}
        <div
          className="hidden sm:flex w-1/3 justify-start relative h-12 items-center"
          onMouseEnter={() => setIsAboutMenuOpen(true)}
          onMouseLeave={() => setIsAboutMenuOpen(false)}
        >
          <button className="flex items-center gap-2 text-slate-600 hover:text-purple-700 font-bold transition-colors cursor-pointer text-lg">
            Sobre
            <motion.div animate={{ rotate: isAboutMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isAboutMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 pt-5"
              >
                {/* MENU GIGANTE E LEGÍVEL (Restaurado) */}
                <div className="w-[640px] bg-white rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-100 p-4 origin-top-left flex gap-3">

                  {/* COLUNA 1: A Plataforma */}
                  <div className="flex-1 bg-slate-50 rounded-2xl p-6 flex flex-col gap-2">
                    <h4 className="text-[11px] font-black text-purple-600 uppercase tracking-widest mb-4 ml-2">A Plataforma</h4>

                    <a href="/?section=whatisdoecerto" className="group flex items-start gap-4 p-3.5 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-purple-600 group-hover:text-purple-700 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Info size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-base font-bold text-slate-800 mb-1">O que é o DoeCerto</span>
                        <span className="block text-sm text-slate-500 font-medium leading-relaxed">Conheça nossa missão e como conectamos você às ONGs de forma segura.</span>
                      </div>
                    </a>

                    <a href="/?section=howitworks" className="group flex items-start gap-4 p-3.5 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-purple-600 group-hover:text-purple-700 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Layers size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-base font-bold text-slate-800 mb-1">Como funciona</span>
                        <span className="block text-sm text-slate-500 font-medium leading-relaxed">Entenda o passo a passo simples para realizar sua doação e fazer a diferença.</span>
                      </div>
                    </a>

                    <a href="/?section=whychooseus" className="group flex items-start gap-4 p-3.5 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-purple-600 group-hover:text-purple-700 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Heart size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-base font-bold text-slate-800 mb-1">Por que nos escolher</span>
                        <span className="block text-sm text-slate-500 font-medium leading-relaxed">Os motivos concretos que nos tornam a plataforma mais confiável para ajudar.</span>
                      </div>
                    </a>
                  </div>

                  {/* COLUNA 2: Transparência & Links Rápidos */}
                  <div className="flex-1 p-6 flex flex-col gap-2">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Transparência & Ajuda</h4>

                    <a href="/?section=verificationbadge" className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                      <ShieldCheck size={20} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                      <span className="text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Selo de Verificação</span>
                    </a>

                    <a href="/?section=visitscarousel" className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                      <MapPin size={20} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                      <span className="text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Nossas Visitas</span>
                    </a>

                    <a href="/?section=partnerssection" className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                      <Handshake size={20} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                      <span className="text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Parceiros</span>
                    </a>

                    <div className="h-px bg-slate-100 my-3 mx-2"></div>

                    <a href="/?section=faq" className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                      <MessageCircle size={20} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                      <span className="text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Dúvidas (FAQ)</span>
                    </a>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTRO - LOGO (Reduzida para ficar mais delicada e proporcional) */}
        <div className="flex flex-1 sm:flex-none sm:w-1/3 justify-start sm:justify-center z-10 nav-anim">
          <button onClick={() => window.location.reload()} className="inline-block cursor-pointer active:scale-95 transition-transform flex items-center">
            {/* Altura reduzida de h-8 para h-6 (mobile) e h-[26px] (desktop) */}
            <img src="/logo-roxa.svg" alt="DoeCerto" className="h-6 sm:h-[26px] object-contain" />
          </button>
        </div>

        {/* LADO DIREITO (w-1/3 no Desktop) */}
        <div className="flex justify-end w-auto sm:w-1/3 relative z-20" ref={menuRef}>
          {isAuth ? (
            <>
              {/* DESKTOP: Botão de Perfil Logado (Com nome e dropdown) */}
              <div className="hidden sm:block">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <motion.div className="shrink-0" animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-purple-700" />
                  </motion.div>
                  <span className="flex-1 min-w-0 truncate text-purple-700 font-bold text-sm px-2">
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
              </div>

              {/* MOBILE ONLY: Avatar (Abre Dropdown) + Hamburger (Abre Gaveta) */}
              <div className="flex items-center gap-3 sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-8 h-8 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-100 cursor-pointer active:scale-95 transition-transform"
                >
                  {displayAvatar && displayAvatar !== "/default-avatar.png" ? (
                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                      <FiUser size={16} className="text-purple-700" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* DROPDOWN COMPARTILHADO (Abre no Desktop e no Mobile pelo Avatar) */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-3 sm:mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] origin-top-right"
                  >
                    <button onClick={goToProfile} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                      <FiUser size={18} className="text-blue-600" />
                      <span className="font-bold text-slate-700">Meu Perfil</span>
                    </button>
                    <button onClick={goToDonations} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                      <FiHeart size={18} className="text-rose-500" />
                      <span className="font-bold text-slate-700">Minhas Doações</span>
                    </button>
                    <button onClick={() => { router.push("/help-center"); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                      <FiHelpCircle size={18} className="text-purple-600" />
                      <span className="font-bold text-slate-700">Central de Ajuda</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left cursor-pointer">
                      <FiLogOut size={18} className="text-slate-500" />
                      <span className="font-bold text-slate-500">Sair</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              {/* DESKTOP ONLY: Auth Buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="hidden sm:flex items-center gap-3">
                <button onClick={() => router.push('/login')} className="w-[110px] py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm cursor-pointer text-center">
                  Entrar
                </button>
                <button onClick={() => router.push('/register')} className="w-[110px] py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-sm transition-all active:scale-95 cursor-pointer text-center">
                  Criar conta
                </button>
              </motion.div>

              {/* MOBILE ONLY: Hamburger (Se deslogado) */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <Menu size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* NOVO MENU MOBILE (GAVETA DESLIZANTE / DRAWER) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Fundo Escuro (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] sm:hidden cursor-pointer"
            />

            {/* Menu Lateral Deslizante */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-[210] flex flex-col sm:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                <span className="font-black text-slate-900 text-lg">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex flex-col p-5 gap-6">
                {/* Links da Landing Page (Sobre) - Aparece sempre */}
                <div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3 block">Conheça o DoeCerto</span>
                  <div className="flex flex-col gap-1">
                    <a href="/?section=whatisdoecerto" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">O que é?</a>
                    <a href="/?section=howitworks" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Como funciona</a>
                    <a href="/?section=whychooseus" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Por que escolher</a>
                    <a href="/?section=verificationbadge" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Selo de Verificação</a>
                    <a href="/?section=visitscarousel" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Nossas Visitas</a>
                    <a href="/?section=partnerssection" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Parceiros</a>
                    <a href="/?section=faq" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 font-bold hover:bg-purple-50 transition-colors">Dúvidas (FAQ)</a>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {isAuth ? (
                  /* Usuário Logado - Apenas o botão de Sair na gaveta */
                  <div className="mt-2">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-95 transition-all cursor-pointer hover:bg-slate-200">
                      <FiLogOut size={18} /> Sair
                    </button>
                  </div>
                ) : (
                  /* Usuário Deslogado - Botões de Entrar/Criar Conta */
                  <div className="flex flex-col gap-3 mt-4">
                    <button onClick={() => router.push('/login')} className="w-full py-3.5 rounded-xl border-2 border-purple-100 bg-white text-purple-700 font-black hover:bg-purple-50 active:scale-95 transition-all cursor-pointer">
                      Entrar
                    </button>
                    <button onClick={() => router.push('/register')} className="w-full bg-purple-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all cursor-pointer">
                      Criar conta
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative mb-6 w-full">
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
            <button onClick={() => setQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <FiX size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-purple-700 text-white shadow-md shadow-purple-200 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <SlidersHorizontal size={16} /> Filtros
            {(activeCategories.length > 0 || sortBy !== 'default') && (
              <span className="bg-white text-purple-700 text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1 font-black">
                {activeCategories.length + (sortBy !== 'default' ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>

          <button
            onClick={handleDistanceFilterClick}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shrink-0 cursor-pointer ${sortBy === 'distance' ? "bg-purple-600 text-white shadow-md shadow-purple-200 border border-transparent" : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"}`}
          >
            Mais próximas
          </button>

          <button
            onClick={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shrink-0 cursor-pointer ${sortBy === 'rating' ? "bg-purple-600 text-white shadow-md shadow-purple-200 border border-transparent" : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"}`}
          >
            Melhores avaliações
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 bg-transparent hover:text-purple-600 hover:underline cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {premiumOngs.length > 0 && query === "" && activeCategories.length === 0 && sortBy === 'default' && (
          <section className="mb-14 relative group/carousel">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Destaques</h2>

            <button onClick={() => scrollCarousel('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-md border border-slate-100 rounded-full p-2 text-slate-500 hover:text-purple-700 transition-colors hidden sm:block cursor-pointer">
              <ChevronLeft size={24} />
            </button>

            <div ref={carouselRef} className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {premiumOngs.map((ong) => (
                <div
                  key={`premium-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="snap-start shrink-0 w-[220px] sm:w-[240px] flex flex-col bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 cursor-pointer group/card"
                >
                  <div className="w-full aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <OngLogo src={ong.img} alt={ong.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    {ong.categories.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide">
                          {ong.categories[0]} {ong.categories.length > 1 && `+${ong.categories.length - 1}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-1 min-w-0">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate">
                        {ong.name}
                      </h3>
                      <VerifiedBadge variant="shimmer" size={16} />
                    </div>

                    <div className="flex-grow"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonateClick(ong.id);
                      }}
                      className="mt-3 w-full bg-purple-700 hover:bg-purple-800 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Apoiar causa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scrollCarousel('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-md border border-slate-100 rounded-full p-2 text-slate-500 hover:text-purple-700 transition-colors hidden sm:block cursor-pointer">
              <ChevronRight size={24} />
            </button>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Todas as Causas</h2>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{filteredCatalog.length} resultados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                <p className="text-slate-500 font-medium text-lg">
                  {sortBy === 'distance'
                    ? "Nenhuma ONG encontrada dentro do raio de 10km da sua localização."
                    : "Nenhuma ONG encontrada com estes filtros."}
                </p>
                <button onClick={clearFilters} className="mt-4 text-purple-600 font-bold hover:underline cursor-pointer">Limpar filtros</button>
              </div>
            ) : (
              filteredCatalog.map((ong) => (
                <div
                  key={`catalog-${ong.id}`}
                  onClick={() => router.push(`/ong-public-profile?id=${ong.id}`)}
                  className="group flex flex-col bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <OngLogo src={ong.img} alt={ong.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    {ong.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase">
                          {ong.categories[0]} {ong.categories.length > 1 && `+${ong.categories.length - 1}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug truncate">
                        {ong.name}
                      </h3>

                      {/* Rating limpo, sem o fundo amarelo */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[12px] font-extrabold text-slate-700">{ong.rating}</span>
                      </div>
                    </div>

                    {sortBy === 'distance' && ong.distance && (
                      <div className="flex items-center gap-1 text-slate-500 shrink-0 mt-1 mb-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-xs font-bold">{ong.distance}</span>
                      </div>
                    )}

                    <div className="flex-grow"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonateClick(ong.id);
                      }}
                      className="mt-3 w-full bg-purple-700 hover:bg-purple-800 text-white rounded-lg py-3 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Apoiar causa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Filtros</h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Ordenar por</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setSortBy('default')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${sortBy === 'default' ? 'bg-purple-700 text-white shadow-md shadow-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                      Padrão
                    </button>
                    <button onClick={() => setSortBy('rating')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${sortBy === 'rating' ? 'bg-purple-700 text-white shadow-md shadow-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                      Melhor Avaliação
                    </button>
                    <button onClick={handleDistanceFilterClick} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${sortBy === 'distance' ? 'bg-purple-700 text-white shadow-md shadow-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                      Menor Distância
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Categorias</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {availableCategories.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhuma categoria disponível no momento.</p>
                    ) : (
                      availableCategories.map((cat, i) => {
                        const isSelected = activeCategories.includes(cat);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer ${isSelected ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            {cat}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all cursor-pointer"
                >
                  Ver {filteredCatalog.length} resultados
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guestModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setGuestModal({ ...guestModal, isOpen: false })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                {guestModal.type === 'donate' ? (
                  <FiUser size={32} className="text-purple-700" />
                ) : (
                  <MapPin size={32} className="text-purple-700" />
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {guestModal.type === 'donate' ? 'Fazer o bem faz bem!' : 'Precisamos da sua localização'}
              </h2>
              <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                {guestModal.type === 'donate'
                  ? 'Você pode criar uma conta para acompanhar o impacto das suas doações, ou seguir de forma anônima.'
                  : 'Faça login ou cadastre-se para informar seu endereço e descobrir quais ONGs estão perto de você.'}
              </p>

              <div className="w-full flex flex-col gap-3">
                <button onClick={() => router.push("/register")} className="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all cursor-pointer">
                  Criar Conta / Entrar
                </button>

                {guestModal.type === 'donate' && (
                  <button onClick={() => { setGuestModal({ ...guestModal, isOpen: false }); setIsModalOpen(true); }} className="w-full py-3.5 text-purple-600 border-2 border-purple-100 font-bold rounded-xl hover:bg-purple-50 active:scale-95 transition-all cursor-pointer">
                    Doar Anonimamente
                  </button>
                )}

                <button onClick={() => setGuestModal({ ...guestModal, isOpen: false })} className="mt-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors cursor-pointer">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && <DonateModal onClose={() => setIsModalOpen(false)} onDonateMoney={goToDonateMoney} onDonateItems={goToDonateItems} />}
    </div>
  );
}