"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Trash2,
  Phone,
  Instagram,
  Tag,
  Wallet,
  Loader2,
  ArrowLeft,
  Building2,
  Search,
  Globe2,
  MapPinned,
  Milestone,
  Info,
  Navigation,
  Flag,
  ExternalLink,
  LogOut,
  ChevronDown,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FormSection } from "@/components/ui/form-section";
import { CustomSelect } from "@/components/ui/custom-select";
import { InputGroup } from "@/components/ui/input-group";
import { ImageUploader } from "@/components/ui/image-uploader";
import { BankAccountService } from "@/services/bank-account.service";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { OngSetupService } from "@/services/ongSetup.service";
import { WishlistService } from "@/services/wishlist.service";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryImpactIcon } from "@/components/ui/CategoryImpactIcon";

export default function OngSetupProfile() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ongName, setOngName] = useState("Minha ONG");
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await Preferences.remove({ key: "access_token" });
      await Preferences.remove({ key: "userRole" });
    } catch (e) {}

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {}

    localStorage.removeItem("access_token");
    localStorage.removeItem("CapacitorStorage.access_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userName");
    localStorage.removeItem("registration_completed");
    localStorage.removeItem("hideDonationTutorial");
    sessionStorage.removeItem("dismiss_ong_setup_prompt");

    await refreshSession();
    window.location.replace("/login");
  };

  // Campos do Perfil
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [years, setYears] = useState("");
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

  // Dados Bancários
  const [bankName, setBankName] = useState("");
  const [agencyNumber, setAgencyNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [accountType, setAccountType] = useState("Corrente");
  const [pixKeyType, setPixKeyType] = useState("CPF");

  const accountTypeOptions = ["Corrente", "Poupança", "Aplicação"];

  const primaryCategoryObj = availableCategories.find((c) => c.id === primaryCategoryId);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        const categories = await OngSetupService.getCategories();
        setAvailableCategories(categories || []);

        const profile = await OngsProfileService.getMyProfile();

        if (profile) {
          setOngId(profile.id);
          setOngName(profile.name || "Minha ONG");
          setDescription(profile.description || "");
          setPhone(profile.contactNumber || "");
          setWebsite(profile.website || "");

          try {
            const wishlistData = await WishlistService.getItems(profile.id);
            setItems(wishlistData || []);
          } catch (err) {
            console.error("Erro ao carregar wishlist");
          }

          if (profile.address && typeof profile.address === 'object') {
            setStreet(profile.address.street || "");
            setNumber(profile.address.number || "");
            setComplement(profile.address.complement || "");
            setNeighborhood(profile.address.neighborhood || "");
            setCity(profile.address.city || "");
            setState(profile.address.state || "");
            setZipCode(profile.address.zipCode || "");
            setCountry(profile.address.country || "Brasil");
          }

          if (profile.yearsOfOperation) setYears(profile.yearsOfOperation.toString());
          if (profile.avatarUrl) setLogoPreview(profile.avatarUrl);
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
        }

        const bankData = await BankAccountService.getMyAccount();
        if (bankData) {
          const savedKey = bankData.pixKey || "";

          setBankName(bankData.bankName || "");
          setAgencyNumber(bankData.agencyNumber || "");
          setAccountNumber(bankData.accountNumber || "");
          setPixKey(bankData.pixKey || "");
          setAccountType(bankData.accountType || "Corrente");

          if (savedKey.includes("@")) {
            setPixKeyType("E-mail");
          } else if (savedKey.startsWith("55") && savedKey.length >= 12) {
            setPixKeyType("Telefone");
          } else if (savedKey.length === 14) {
            setPixKeyType("CNPJ");
          } else if (savedKey.length === 11) {
            setPixKeyType("CPF");
          } else if (savedKey.length > 0) {
            setPixKeyType("Chave Aleatória");
          } else {
            setPixKeyType("CPF");
          }
        }

      } catch (error) {
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

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP inválido ou não encontrado.");
        return;
      }
      setStreet(data.logradouro);
      setNeighborhood(data.bairro);
      setCity(data.localidade);
      setState(data.uf);
      toast.success("Endereço localizado!");
    } catch (error) {
      toast.error("Erro ao consultar o serviço de CEP.");
    }
  };

  const validateForm = () => {
    if (!description.trim()) { toast.error("A descrição da ONG é obrigatória."); return false; }
    if (!years) { toast.error("Informe os anos de atuação."); return false; }

    // TRAVA DE VALIDAÇÃO DO WHATSAPP (Impede apenas o "55" ou campo incompleto)
    const rawPhone = phone.replace(/\D/g, "");
    if (!rawPhone || rawPhone === "55" || rawPhone.length < 12) {
      toast.error("O número de contato válido com o DDD é obrigatório.");
      return false;
    }

    if (!zipCode.trim()) { toast.error("O CEP é obrigatório."); return false; }
    if (!street.trim()) { toast.error("O nome da rua é obrigatório."); return false; }
    if (!number.trim()) { toast.error("O número do endereço é obrigatório."); return false; }
    if (!neighborhood.trim()) { toast.error("O bairro é obrigatório."); return false; }
    if (!city.trim()) { toast.error("A cidade é obrigatória."); return false; }
    if (!state.trim()) { toast.error("O estado (UF) é obrigatório."); return false; }
    if (selectedCategoryIds.length === 0) { toast.error("Selecione pelo menos uma categoria."); return false; }
    if (!primaryCategoryId) { toast.error("Selecione a Causa Principal da sua ONG."); return false; }

    if (!bankName.trim() || !pixKey.trim()) {
      toast.error("Complete os dados bancários para receber doações.");
      return false;
    }

    return true;
  };

  const handleFinalize = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");

      const payload = {
        description,
        contactNumber: cleanPhone,
        websiteUrls: website?.trim() ? [website.trim()] : undefined,
        categoryIds: selectedCategoryIds,
        primaryCategoryId: primaryCategoryId || (selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined),
        yearsOfOperation: years ? Number(years) : undefined,
        address: { street, number, complement, neighborhood, city, state, zipCode, country },
      };

      await OngSetupService.updateProfileData(payload);

      if (logoFile || bannerFile) {
        await OngSetupService.updateProfileImages(
          logoFile,
          bannerFile,
          bannerFile ? bannerCrop : undefined
        );
      }

      await BankAccountService.saveAccount({
        bankName,
        agencyNumber,
        accountNumber,
        accountType,
        pixKey,
      });

      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => {
        router.push("/ong-dashboard");
      }, 1500);
    } catch (error: any) {
      const msg = error.message?.includes("avatar")
        ? "A imagem da logo é muito grande ou inválida."
        : (error?.response?.data?.message || error?.message || "Não foi possível salvar os dados do perfil. Verifique as informações e tente novamente.");
      toast.error(msg);
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

            <FormSection title="Atuação (Anos) *" icon={Award} className="flex flex-col justify-center">
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="Ex: 5"
                className="w-full text-xl font-black text-gray-900 bg-gray-50 p-4 rounded-xl outline-none border-none"
              />
            </FormSection>
          </div>
          

          <FormSection title="Canais de Contato *" italicTitle>
            <div className="space-y-3 sm:space-y-4">

              {/* CONTAINER COM O PREFIXO +55 FIXO VISUALMENTE */}
              <div className="flex rounded-xl bg-gray-50 overflow-hidden border border-transparent focus-within:border-purple-200 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <div className="flex items-center justify-center bg-gray-100 text-gray-500 px-4 text-sm font-bold select-none border-r border-gray-200/60 gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>+55</span>
                </div>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={getDisplayPhone(phone)}
                  className="w-full bg-transparent p-4 outline-none text-sm text-gray-700"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    // Mantém o '55' guardado de forma transparente no state
                    setPhone(`55${digits}`);
                  }}
                />
              </div>

              <InputGroup
                icon={ExternalLink}
                placeholder="Ex: https://site.org ou instagram.com/suaong"
                iconColor="text-pink-400"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection title="Localização *" italicTitle>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <InputGroup
                  icon={Search}
                  placeholder="CEP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  onBlur={handleCEPBlur}
                />
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

          <FormSection
            title="Dados de Recebimento *"
            icon={Wallet}
            className="bg-gradient-to-br from-white to-purple-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

              {/* BANCO */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-purple-400 mb-1 block ml-1">
                  Instituição Bancária *
                </label>

                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú..."
                  className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none text-sm focus:border-purple-300 transition-colors shadow-sm"
                />
              </div>

              {/* TIPO DE CONTA */}
              <CustomSelect
                label="Tipo de Conta *"
                value={accountType}
                options={accountTypeOptions}
                onChange={setAccountType}
              />

              {/* TIPO DE CHAVE PIX */}
              <div className="relative">
                <CustomSelect
                  label="Tipo de Chave PIX *"
                  value={pixKeyType || "CPF"}
                  options={[
                    "CPF",
                    "CNPJ",
                    "Telefone",
                    "E-mail",
                    "Chave Aleatória",
                  ]}
                  onChange={(value) => {
                    setPixKeyType(value);

                    // telefone já começa com 55
                    setPixKey(value === "Telefone" ? "55" : "");
                  }}
                />
              </div>

              {/* CHAVE PIX */}
              {pixKeyType && (
                <div className="flex flex-col md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-purple-400 mb-1 block ml-1">
                    Chave PIX *
                  </label>

                  {/* TELEFONE */}
                  {pixKeyType === "Telefone" ? (
                    <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden focus-within:border-purple-300 transition-colors">

                      {/* PREFIXO FIXO */}
                      <div className="px-4 py-4 bg-purple-50 text-purple-600 font-black text-sm border-r border-gray-100">
                        +55
                      </div>

                      {/* INPUT */}
                      <input
                        value={pixKey.replace(/^55/, "")}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");

                          // DDD + número
                          value = value.slice(0, 11);

                          setPixKey(`55${value}`);
                        }}
                        placeholder="81999999999"
                        className="w-full bg-white p-4 outline-none text-sm"
                      />
                    </div>
                  ) : (
                    <input
                      value={pixKey}
                      onChange={(e) => {
                        let value = e.target.value;

                        // CPF
                        if (pixKeyType === "CPF") {
                          value = value.replace(/\D/g, "").slice(0, 11);
                        }

                        // CNPJ
                        if (pixKeyType === "CNPJ") {
                          value = value.replace(/\D/g, "").slice(0, 14);
                        }

                        setPixKey(value);
                      }}
                      placeholder={
                        pixKeyType === "CPF"
                          ? "Somente números do CPF"
                          : pixKeyType === "CNPJ"
                            ? "Somente números do CNPJ"
                            : pixKeyType === "E-mail"
                              ? "email@exemplo.com"
                              : "Cole sua chave aleatória"
                      }
                      className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none text-sm focus:border-purple-300 transition-colors shadow-sm"
                    />
                  )}

                  {pixKeyType === "Telefone" && (
                    <span className="text-xs sm:text-sm text-gray-500 mt-2 ml-1 font-medium">
                      O código do Brasil (+55) é fixo e não pode ser removido.
                    </span>
                  )}
                </div>
              )}

              {/* AGÊNCIA */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-purple-400 mb-1 block ml-1">
                  Agência
                </label>

                <input
                  value={agencyNumber}
                  onChange={(e) => setAgencyNumber(e.target.value)}
                  placeholder="0001"
                  className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none text-sm focus:border-purple-300 transition-colors shadow-sm"
                />
              </div>

              {/* CONTA */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-purple-400 mb-1 block ml-1">
                  Conta com Dígito
                </label>

                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="12345-6"
                  className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none text-sm focus:border-purple-300 transition-colors shadow-sm"
                />
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
