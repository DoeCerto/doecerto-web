"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Trash2,
  Phone,
  Tag,
  Loader2,
  ArrowLeft,
  Building2,
  Search,
  Globe,
  Globe2,
  MapPinned,
  Milestone,
  Info,
  Navigation,
  Flag,
  LogOut,
  ChevronDown,
  Check,
  CheckCircle2,
  Calendar,
  MapPin
} from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FormSection } from "@/components/ui/form-section";
import { InputGroup } from "@/components/ui/input-group";
import { ImageUploader } from "@/components/ui/image-uploader";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { OngSetupService } from "@/services/ongSetup.service";
import { WishlistService } from "@/services/wishlist.service";
import { lookupCep } from "@/services/register-ong.service";
import { formatCEP, formatBrazilianPhone } from "@/utils/documentValidation";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";
import { LgpdSecurityZone } from "@/components/specific/Lgpd/LgpdSecurityZone";

export default function OngSetupProfile() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userRole, refreshSession, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ongName, setOngName] = useState("Minha ONG");
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  // Bloqueio rigoroso de autenticação: redireciona para login se deslogado ou sem role de ONG
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (userRole !== "ong" && userRole !== "admin"))) {
      window.location.replace("/login");
    }
  }, [authLoading, isAuthenticated, userRole]);

  // Previne restauração deslogada via BFCache (botão voltar do navegador)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        refreshSession();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [refreshSession]);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await logout("/login");
  };

  // Campos do Perfil e Canais Sociais
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [foundedAt, setFoundedAt] = useState<string | null>(null);
  const [years, setYears] = useState("");

  // Endereço (somente leitura quando já cadastrado no /register; fallback CEP para ONGs legadas)
  const [hasExistingAddress, setHasExistingAddress] = useState(false);
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(null);
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState(false);
  const primaryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (primaryDropdownRef.current && !primaryDropdownRef.current.contains(ev.target as Node)) {
        setIsPrimaryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Imagens
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerCrop, setBannerCrop] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Lista de Desejos
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [ongId, setOngId] = useState<number | null>(null);

  const primaryCategoryObj = availableCategories.find((c) => c.id === primaryCategoryId);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        const categories = await OngSetupService.getCategories();
        setAvailableCategories(categories || []);

        const profile = await OngsProfileService.getMyProfile().catch((err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            window.location.replace("/login");
          }
          return null;
        });

        if (!profile) {
          window.location.replace("/login");
          return;
        }

        setOngId(profile.id);
        setOngName(profile.name || "Minha ONG");
        setDescription(profile.description || "");
        setPhone(profile.contactNumber || "");
        setWhatsappNumber(profile.whatsappNumber || "");
        setWebsiteUrl(profile.websiteUrl || profile.website || "");
        setInstagramUrl(profile.instagramUrl || "");
        setFacebookUrl(profile.facebookUrl || "");
        setFoundedAt(profile.foundedAt || null);

        try {
          const wishlistData = await WishlistService.getItems(profile.id);
          setItems(wishlistData || []);
        } catch {
          console.error("Erro ao carregar wishlist");
        }

        if (profile.address && typeof profile.address === 'object') {
          const addr = profile.address;
          const addressComplete = Boolean(addr.street && addr.city && addr.state && addr.zipCode);
          setHasExistingAddress(addressComplete);
          setStreet(addr.street || "");
          setNumber(addr.number || "");
          setComplement(addr.complement || "");
          setNeighborhood(addr.neighborhood || "");
          setCity(addr.city || "");
          setState(addr.state || "");
          setZipCode(addr.zipCode || "");
          setCountry(addr.country || "Brasil");
        }

        if (typeof profile.yearsOfOperation === "number") {
          setYears(profile.yearsOfOperation.toString());
        } else if (profile.foundedAt) {
          const diff = Math.max(0, new Date().getFullYear() - new Date(profile.foundedAt).getFullYear());
          setYears(diff.toString());
        }

        if (profile.avatarUrl) setLogoPreview(profile.avatarUrl);
        if (profile.bannerUrl) setBannerPreview(profile.bannerUrl);

        if (profile.categories) {
          setSelectedCategoryIds(profile.categories.map((c: any) => c.id));
        }
        if (profile.primaryCategoryId) {
          setPrimaryCategoryId(profile.primaryCategoryId);
        } else if (profile.primaryCategory?.id) {
          setPrimaryCategoryId(profile.primaryCategory.id);
        } else if (profile.categories && profile.categories.length > 0) {
          setPrimaryCategoryId(profile.categories[0].id);
        }

      } catch (error: any) {
        if (error?.status === 401 || error?.status === 403) {
          window.location.replace("/login");
          return;
        }
        toast.error("Erro ao sincronizar dados com o servidor.");
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleLogoChange = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (file: File) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter(c => c !== id) : [...prev, id];

      // Ajusta a causa principal se necessário
      if (isRemoving && primaryCategoryId === id) {
        setPrimaryCategoryId(next.length > 0 ? next[0] : null);
      } else if (!isRemoving && (primaryCategoryId === null || next.length === 1)) {
        setPrimaryCategoryId(id);
      }
      return next;
    });
  };

  const handleAddItems = async () => {
    if (!newItem.trim()) {
      toast.error("Digite o nome do item para adicionar.");
      return;
    }
    if (!ongId) return;

    try {
      const addedItem = await WishlistService.addItem(ongId, newItem.trim(), 1);
      setItems(prev => [...prev, addedItem]);
      setNewItem("");
      toast.success("Item adicionado à lista!");
    } catch (error) {
      toast.error("Não foi possível salvar o item.");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!ongId) return;
    try {
      await WishlistService.deleteItem(ongId, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Item removido.");
    } catch (error) {
      toast.error("Erro ao excluir item.");
    }
  };

  const handleCEPBlur = async () => {
    const cleanCEP = zipCode.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return;

    setLookingUpCep(true);
    try {
      const data = await lookupCep(cleanCEP);
      if (data.street) setStreet(data.street);
      if (data.neighborhood) setNeighborhood(data.neighborhood);
      if (data.city) setCity(data.city);
      if (data.state) setState(data.state);
      toast.success("Endereço localizado!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao consultar o serviço de CEP.");
    } finally {
      setLookingUpCep(false);
    }
  };

  const validateForm = () => {
    if (!description.trim()) { toast.error("A descrição da ONG é obrigatória."); return false; }
    if (!foundedAt && years.trim() === "") { toast.error("Informe os anos de atuação."); return false; }

    // Validação do Telefone Principal (aceita 10-11 dígitos locais ou 55 + 10-11 dígitos)
    const rawPhone = phone.replace(/\D/g, "");
    const localPhone = rawPhone.startsWith("55") && rawPhone.length >= 12 ? rawPhone.slice(2) : rawPhone;
    if (localPhone.length < 10 || localPhone.length > 11) {
      toast.error("O número de contato válido com o DDD é obrigatório.");
      return false;
    }

    const rawWhatsapp = whatsappNumber.replace(/\D/g, "");
    if (rawWhatsapp && rawWhatsapp !== "55") {
      const localWa = rawWhatsapp.startsWith("55") && rawWhatsapp.length >= 12 ? rawWhatsapp.slice(2) : rawWhatsapp;
      if (localWa.length < 10 || localWa.length > 11) {
        toast.error("Número de WhatsApp inválido. Informe DDD + número ou deixe em branco.");
        return false;
      }
    }

    if (!hasExistingAddress) {
      if (!zipCode.trim()) { toast.error("O CEP é obrigatório."); return false; }
      if (!street.trim()) { toast.error("O nome da rua é obrigatório."); return false; }
      if (!number.trim()) { toast.error("O número do endereço é obrigatório."); return false; }
      if (!neighborhood.trim()) { toast.error("O bairro é obrigatório."); return false; }
      if (!city.trim()) { toast.error("A cidade é obrigatória."); return false; }
      if (!state.trim()) { toast.error("O estado (UF) é obrigatório."); return false; }
    }

    if (selectedCategoryIds.length === 0) { toast.error("Selecione pelo menos uma categoria."); return false; }
    if (!primaryCategoryId) { toast.error("Selecione a Causa Principal da sua ONG."); return false; }

    return true;
  };

  const handleFinalize = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const cleanWa = whatsappNumber.replace(/\D/g, "");
      const normalizedWa = cleanWa && cleanWa !== "55" ? cleanWa : "";

      const payload = {
        description,
        contactNumber: cleanPhone,
        whatsappNumber: normalizedWa,
        websiteUrl: websiteUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        categoryIds: selectedCategoryIds,
        primaryCategoryId: primaryCategoryId || (selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined),
        yearsOfOperation: !foundedAt && years !== "" ? Number(years) : undefined,
        ...(hasExistingAddress
          ? {}
          : {
              address: { street, number, complement, neighborhood, city, state, zipCode, country },
            }),
      };

      await OngSetupService.updateProfileData(payload);

      if (logoFile || bannerFile) {
        await OngSetupService.updateProfileImages(
          logoFile,
          bannerFile,
          bannerFile ? bannerCrop : undefined
        );
      }

      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => {
        router.push("/ong-dashboard");
      }, 1500);
    } catch (error: any) {
      const backendMsg = error?.data?.message || error?.response?.data?.message || error?.message;
      const msg = error.message?.includes("avatar")
        ? "A imagem da logo é muito grande ou inválida."
        : (backendMsg || "Não foi possível salvar os dados do perfil. Verifique as informações e tente novamente.");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper para exibir no campo apenas os dígitos que vêm depois do 55
  const getDisplayPhone = (fullPhone: string) => {
    const clean = fullPhone.replace(/\D/g, "");
    if (clean.startsWith("55")) {
      return clean.substring(2);
    }
    return clean;
  };

  if (authLoading || initialLoading || !isAuthenticated || (userRole !== "ong" && userRole !== "admin")) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#6B39A7]" size={40} />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Verificando credenciais...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="relative w-full">
        <ImageUploader
          variant="banner"
          image={bannerPreview}
          onImageChange={handleBannerChange}
          onCropChange={setBannerCrop}
          label="Capa do Perfil"
        />

        <button
          onClick={() => router.push("/ong-dashboard")}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white px-3.5 py-2 rounded-full z-30 shadow-md text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200"
          title="Voltar ao Painel"
        >
          <ArrowLeft size={16} />
          <span>Painel</span>
        </button>

        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white hover:text-red-600 px-3.5 py-2 rounded-full z-30 shadow-md text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200"
          title="Sair da conta"
        >
          <LogOut size={16} className="text-red-500" />
          <span>Sair</span>
        </button>

        <div className="absolute -bottom-14 left-6 sm:left-10 z-40">
          <ImageUploader
            variant="logo"
            image={logoPreview}
            onImageChange={handleLogoChange}
            label="Logo"
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-20 sm:mt-24 max-w-4xl mx-auto">
        <header className="flex flex-col items-start text-left pt-6">
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight break-words w-full">
            {ongName}
          </h1>
          <p className="text-[#6B39A7] text-[10px] sm:text-xs mt-1 uppercase font-black tracking-widest opacity-70">
            Configure as informações públicas da sua ONG
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormSection title="Sobre a ONG *" className="md:col-span-2">
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Conte sobre a missão e o impacto da sua organização..."
                  className="w-full text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 border-none transition-all resize-none"
                  rows={4}
                />

                <div className="flex justify-between items-center px-1">
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">
                    Máximo de 500 caracteres
                  </span>

                  <span
                    className={`text-xs font-bold transition-colors ${description.length >= 500
                      ? "text-red-500"
                      : description.length >= 450
                        ? "text-orange-500"
                        : "text-purple-500"
                      }`}
                  >
                    {description.length}/500
                  </span>
                </div>
              </div>
            </FormSection>

            <FormSection title="Tempo de Atuação" icon={Award} className="flex flex-col justify-center">
              {foundedAt ? (
                <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      {years || "0"} {Number(years) === 1 ? "ano" : "anos"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      CNPJ
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#6B39A7] shrink-0" />
                    <span>
                      Fundada em {new Date(foundedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })} (Receita Federal)
                    </span>
                  </p>
                </div>
              ) : (
                <input
                  type="number"
                  min={0}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full text-xl font-black text-gray-900 bg-gray-50 p-4 rounded-xl outline-none border-none"
                />
              )}
            </FormSection>
          </div>

          <FormSection title="Canais de Contato & Redes Sociais" italicTitle>
            <div className="space-y-3 sm:space-y-4">
              {/* TELEFONE PRINCIPAL COM +55 FIXO */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-1.5 block">
                  Telefone Institucional *
                </label>
                <div className="flex rounded-xl bg-gray-50 overflow-hidden border border-transparent focus-within:border-purple-200 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <div className="flex items-center justify-center bg-gray-100 text-gray-500 px-4 text-sm font-bold select-none border-r border-gray-200/60 gap-2">
                    <Phone size={16} className="text-[#6B39A7]" />
                    <span>+55</span>
                  </div>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={formatBrazilianPhone(getDisplayPhone(phone))}
                    className="w-full bg-transparent p-4 outline-none text-sm text-gray-700"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setPhone(digits ? `55${digits}` : "");
                    }}
                  />
                </div>
              </div>

              {/* WHATSAPP */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-1.5 block">
                  WhatsApp de Atendimento (Opcional)
                </label>
                <div className="flex rounded-xl bg-gray-50 overflow-hidden border border-transparent focus-within:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <div className="flex items-center justify-center bg-gray-100 text-emerald-700 px-4 text-sm font-bold select-none border-r border-gray-200/60 gap-2">
                    <FaWhatsapp size={17} className="text-emerald-600" />
                    <span>+55</span>
                  </div>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={formatBrazilianPhone(getDisplayPhone(whatsappNumber))}
                    className="w-full bg-transparent p-4 outline-none text-sm text-gray-700"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setWhatsappNumber(digits ? `55${digits}` : "");
                    }}
                  />
                </div>
              </div>

              {/* SITE OFICIAL */}
              <InputGroup
                icon={Globe}
                placeholder="Site oficial (Ex: https://suaong.org.br)"
                iconColor="text-[#6B39A7]"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />

              {/* INSTAGRAM E FACEBOOK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 w-full bg-gray-50 p-3.5 rounded-xl border border-transparent focus-within:border-pink-200 focus-within:bg-white transition-all">
                  <FaInstagram size={18} className="text-pink-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="Instagram (@perfil ou URL)"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3 w-full bg-gray-50 p-3.5 rounded-xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                  <FaFacebook size={18} className="text-blue-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="Facebook (facebook.com/suaong)"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title={hasExistingAddress ? "Sede Cadastrada" : "Localização *"} italicTitle>
            {hasExistingAddress ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6B39A7] flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {street}{number ? `, ${number}` : ""}{complement ? ` • ${complement}` : ""}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {neighborhood ? `${neighborhood} — ` : ""}{city}/{state} • CEP {formatCEP(zipCode)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Endereço validado no cadastro inicial e sincronizado com a geolocalização.
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider shrink-0">
                  <CheckCircle2 size={13} />
                  Verificado
                </span>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <InputGroup
                      icon={lookingUpCep ? Loader2 : Search}
                      placeholder="CEP"
                      value={formatCEP(zipCode)}
                      onChange={(e) => setZipCode(formatCEP(e.target.value))}
                      onBlur={handleCEPBlur}
                    />
                  </div>
                  <InputGroup
                    icon={Globe2}
                    placeholder="País"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <InputGroup
                  icon={MapPinned}
                  placeholder="Rua / Logradouro"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/3">
                    <InputGroup icon={Milestone} placeholder="Nº" value={number} onChange={(e) => setNumber(e.target.value)} />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <InputGroup icon={Info} placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} />
                  </div>
                </div>

                <InputGroup icon={Navigation} placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="col-span-2">
                    <InputGroup icon={Building2} placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <InputGroup
                      icon={Flag}
                      placeholder="UF"
                      value={state}
                      maxLength={2}
                      onChange={(e) => setState(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
                    />
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Categorias de Atuação *" icon={Tag}>
            <div className="space-y-6">
              {/* Tags de categorias */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1 mb-2.5 block">
                  Selecione todas as causas que sua ONG atende
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#6B39A7] text-white border-[#6B39A7] shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-purple-50/60 hover:text-purple-700 hover:border-purple-200"
                        }`}
                      >
                        <CategoryImpactIcon
                          category={cat.name}
                          size={16}
                          className={isSelected ? "text-purple-200" : "text-gray-400"}
                        />
                        <span>{cat.name}</span>
                        {isSelected && <Check size={14} className="stroke-[3] text-purple-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor da Causa Principal */}
              <div className="pt-5 border-t border-gray-100">
                <div className="space-y-1 mb-2 ml-1">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-wider block">
                    Causa Principal da Instituição *
                  </label>
                  <p className="text-xs text-gray-500 font-medium">
                    Escolha qual das causas acima melhor representa a missão central da ONG.
                  </p>
                </div>

                <div className="relative" ref={primaryDropdownRef}>
                  {selectedCategoryIds.length === 0 ? (
                    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-400 text-sm font-medium flex items-center justify-between cursor-not-allowed select-none">
                      <span>Selecione as categorias acima primeiro</span>
                      <ChevronDown size={18} className="text-gray-300" />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPrimaryDropdownOpen(!isPrimaryDropdownOpen)}
                        className={`w-full bg-white p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-left transition-all shadow-xs cursor-pointer ${
                          isPrimaryDropdownOpen
                            ? "border-[#6B39A7] ring-2 ring-purple-100"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6B39A7] flex items-center justify-center shrink-0">
                            <CategoryImpactIcon category={primaryCategoryObj?.name} size={18} />
                          </div>
                          <span className="truncate text-sm sm:text-base font-bold text-gray-900">
                            {primaryCategoryObj?.name || "Selecione a causa principal"}
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-purple-600 transition-transform duration-200 shrink-0 ml-2 ${
                            isPrimaryDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isPrimaryDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden p-1.5"
                          >
                            <div className="max-h-60 overflow-y-auto space-y-1">
                              {availableCategories
                                .filter((c) => selectedCategoryIds.includes(c.id))
                                .map((cat) => {
                                  const isCurrent = primaryCategoryId === cat.id;
                                  return (
                                    <button
                                      key={`primary-opt-${cat.id}`}
                                      type="button"
                                      onClick={() => {
                                        setPrimaryCategoryId(cat.id);
                                        setIsPrimaryDropdownOpen(false);
                                      }}
                                      className={`w-full p-3 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                                        isCurrent
                                          ? "bg-purple-50 text-[#6B39A7] font-bold"
                                          : "text-gray-700 font-semibold hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                                            isCurrent ? "text-[#6B39A7]" : "text-gray-400"
                                          }`}
                                        >
                                          <CategoryImpactIcon category={cat.name} size={16} />
                                        </div>
                                        <span className="truncate text-sm">{cat.name}</span>
                                      </div>
                                      {isCurrent && (
                                        <Check size={16} className="text-[#6B39A7] shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Lista de Desejos (O que a ONG precisa?)">
            <div className="grid grid-cols-[1fr_48px] gap-2 mb-4">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ex: Alimentos, Cobertores..."
                className="w-full bg-gray-50 p-3 rounded-xl outline-none text-sm border-none focus:ring-1 focus:ring-purple-100"
              />
              <button
                type="button"
                onClick={handleAddItems}
                className="aspect-square bg-[#6B39A7] text-white flex items-center justify-center rounded-xl active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item.id} className="flex items-center gap-2 bg-purple-50 text-[#6B39A7] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-purple-100 shadow-sm">
                  {item.description}
                  <Trash2 size={14} className="cursor-pointer text-red-400 hover:text-red-600 transition-colors" onClick={() => handleDeleteItem(item.id)} />
                </span>
              ))}
            </div>
          </FormSection>

          <FormSection>
            <LgpdSecurityZone userRole="ong" userName={ongName} />
          </FormSection>
        </div>
      </div>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 left-0 right-0 px-4 z-[100]">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Salvar Perfil e Continuar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
