"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function OngSetupProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ongName, setOngName] = useState("Minha ONG");
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

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

  // Imagens
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerCrop, setBannerCrop] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

          if (profile.address && typeof profile.address === "object") {
            setStreet(profile.address.street || "");
            setNumber(profile.address.number || "");
            setComplement(profile.address.complement || "");
            setNeighborhood(profile.address.neighborhood || "");
            setCity(profile.address.city || "");
            setState(profile.address.state || "");
            setZipCode(profile.address.zipCode || "");
            setCountry(profile.address.country || "Brasil");
          }

          if (profile.yearsOfOperation)
            setYears(profile.yearsOfOperation.toString());
          if (profile.avatarUrl) setLogoPreview(profile.avatarUrl);
          if (profile.bannerUrl) setBannerPreview(profile.bannerUrl);
          if (profile.categories)
            setSelectedCategoryIds(profile.categories.map((c: any) => c.id));
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
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleAddItems = async () => {
    if (!newItem.trim()) {
      toast.error("Digite o nome do item para adicionar.");
      return;
    }
    if (!ongId) return;

    try {
      const addedItem = await WishlistService.addItem(ongId, newItem.trim(), 1);
      setItems((prev) => [...prev, addedItem]);
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
      setItems((prev) => prev.filter((item) => item.id !== itemId));
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
    if (!description.trim()) {
      toast.error("A descrição da ONG é obrigatória.");
      return false;
    }

    if (!years) {
      toast.error("Informe os anos de atuação.");
      return false;
    }

    // Telefone opcional
    if (phone.trim()) {
      const rawPhone = phone.replace(/\D/g, "");

      if (rawPhone === "55" || rawPhone.length < 12) {
        toast.error("Número de contato inválido.");
        return false;
      }
    }

    // Endereço obrigatório
    if (!zipCode.trim()) {
      toast.error("O CEP é obrigatório.");
      return false;
    }

    if (!street.trim()) {
      toast.error("O nome da rua é obrigatório.");
      return false;
    }

    if (!number.trim()) {
      toast.error("O número do endereço é obrigatório.");
      return false;
    }

    if (!neighborhood.trim()) {
      toast.error("O bairro é obrigatório.");
      return false;
    }

    if (!city.trim()) {
      toast.error("A cidade é obrigatória.");
      return false;
    }

    if (!state.trim()) {
      toast.error("O estado (UF) é obrigatório.");
      return false;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error("Selecione pelo menos uma categoria.");
      return false;
    }

    // Dados bancários obrigatórios
    if (!bankName.trim()) {
      toast.error("Informe a instituição bancária.");
      return false;
    }

    if (!agencyNumber.trim() || agencyNumber.trim().length < 3) {
      toast.error("Informe uma agência válida.");
      return false;
    }

    if (!accountNumber.trim() || accountNumber.trim().length < 3) {
      toast.error("Informe uma conta válida.");
      return false;
    }

    if (!pixKey.trim()) {
      toast.error("Informe uma chave PIX.");
      return false;
    }

    return true;
  };

  const handleFinalize = () => {
    if (!validateForm()) return;

    setShowConfirmModal(true);
  };

  const saveProfile = async () => {
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "");

      const payload = {
        description,
        contactNumber: cleanPhone,
        websiteUrls: website?.trim() ? [website.trim()] : undefined,
        categoryIds: selectedCategoryIds,
        yearsOfOperation: years ? Number(years) : undefined,
        address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zipCode,
          country,
        },
      };

      await OngSetupService.updateProfileData(payload);

      if (logoFile || bannerFile) {
        await OngSetupService.updateProfileImages(
          logoFile,
          bannerFile,
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
        : "Ocorreu um erro ao salvar os dados.";

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
          label="Capa do Perfil"
        />

        <button
          onClick={() => router.push("/ong-dashboard")}
          className="absolute top-4 left-4 bg-white/90 p-2 rounded-full z-30 shadow-md text-gray-900 hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
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
                    className={`text-xs font-bold transition-colors ${
                      description.length >= 500
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

            <FormSection
              title="Atuação (Anos) *"
              icon={Award}
              className="flex flex-col justify-center"
            >
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="Ex: 5"
                className="w-full text-xl font-black text-gray-900 bg-gray-50 p-4 rounded-xl outline-none border-none"
              />
            </FormSection>
          </div>

          <FormSection title="Canais de Contato" italicTitle>
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
                  <InputGroup
                    icon={Milestone}
                    placeholder="Nº"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-2/3">
                  <InputGroup
                    icon={Info}
                    placeholder="Complemento"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </div>
              </div>

              <InputGroup
                icon={Navigation}
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="col-span-2">
                  <InputGroup
                    icon={Building2}
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <InputGroup
                    icon={Flag}
                    placeholder="UF"
                    value={state}
                    maxLength={2}
                    onChange={(e) =>
                      setState(
                        e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase(),
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Categorias de Causa * (Selecione pelo menos uma)"
            icon={Tag}
          >
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all border ${
                    selectedCategoryIds.includes(cat.id)
                      ? "bg-[#6B39A7] text-white border-[#6B39A7] shadow-md"
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-purple-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
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
                <span
                  key={item.id}
                  className="flex items-center gap-2 bg-purple-50 text-[#6B39A7] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-purple-100 shadow-sm"
                >
                  {item.description}
                  <Trash2
                    size={14}
                    className="cursor-pointer text-red-400 hover:text-red-600 transition-colors"
                    onClick={() => handleDeleteItem(item.id)}
                  />
                </span>
              ))}
            </div>
          </FormSection>
        </div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-0 right-0 px-4 z-[100]"
      >
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Salvar Perfil e Continuar"
            )}
          </button>
        </div>
      </motion.div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Confirmar alterações
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Você está prestes a atualizar as informações públicas da sua ONG.
              Verifique os dados antes de continuar.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  saveProfile();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
