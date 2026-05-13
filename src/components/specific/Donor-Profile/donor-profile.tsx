"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast"; // Importação adicionada
import {
  User,
  Mail,
  Phone,
  Camera,
  ArrowLeft,
  Heart,
  Package,
  Calendar,
  DollarSign,
  History,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MonetaryDonationDetails } from "@/components/ui/MonetaryDonationDetails";
import { MaterialDonationDetails } from "@/components/ui/MaterialDonationDetails";
import { DonorService, type UpdateProfileDTO, type DonationHistory, Address } from "@/services/donor.service";

export default function DonorProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil",
  });

  const [donorData, setDonorData] = useState({
    name: "Carregando...",
    email: "",
    cpf: "",
    phone: "",
    description: "",
  });

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");

    setAddress(prev => ({
      ...prev,
      zipCode: cep
    }));

    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setAddress(prev => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
        country: "Brasil"
      }));

      toast.success("Endereço preenchido automaticamente!");
    } catch {
      toast.error("Erro ao buscar CEP");
    }
  };

  // CARREGAR PERFIL E HISTÓRICO
  useEffect(() => {
    async function loadAllData() {
      try {
        setIsLoading(true);
        setIsHistoryLoading(true);

        const [profile, history, addressRes] = await Promise.allSettled([
          DonorService.getMyProfile(),
          DonorService.getDonationHistory(),
          DonorService.getMyAddress(),
        ]);

        const profileData =
          profile.status === "fulfilled" ? profile.value : null;

        const historyData =
          history.status === "fulfilled" ? history.value : [];

        const addressData =
          addressRes.status === "fulfilled" ? addressRes.value : null;

        // PROFILE
        if (profileData) {
          setDonorData({
            name: profileData.name || "",
            email: profileData.email || "",
            cpf: profileData.cpf || "",
            phone: profileData.phone || "",
            description: profileData.description || "",
          });

          if (profileData.avatarUrl) {
            setProfileImage(profileData.avatarUrl);
          }

          if (!profileData.phone) {
            setShowCompleteModal(true);
          }
        }

        // HISTORY
        setDonationHistory(historyData);

        // ADDRESS 
        if (addressData) {
          setAddress({
            zipCode: addressData.zipCode || "",
            street: addressData.street || "",
            number: addressData.number || "",
            complement: addressData.complement || "",
            neighborhood: addressData.neighborhood || "",
            city: addressData.city || "",
            state: addressData.state || "",
            country: addressData.country || "Brasil",
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar os dados do perfil.");
      } finally {
        setIsLoading(false);
        setIsHistoryLoading(false);
      }
    }

    loadAllData();
  }, []);

  // SALVAR ALTERAÇÕES
  const handleUpdateInfo = async () => {
    try {
      setIsLoading(true);

      // 1. Atualizar Nome
      const isNameValid = donorData.name &&
        donorData.name !== "Carregando..." &&
        donorData.name.trim().length >= 2;

      if (isNameValid) {
        await DonorService.updateAccountName(donorData.name.trim());
      }

      if (address) {
        await DonorService.createOrUpdateAddress(address);
      }

      // 2. Atualizar Perfil
      const profilePayload: UpdateProfileDTO = {
        contactNumber: donorData.phone,
        description: donorData.description || "",
      };
      await DonorService.updateProfile(profilePayload);

      // 3. Recarregar dados
      const freshData = await DonorService.getMyProfile();
      setDonorData({
        name: freshData.name || "",
        email: freshData.email || "",
        cpf: freshData.cpf || "",
        phone: freshData.phone || "",
        description: freshData.description || "",
      });

      setIsEditingProfile(false);
      setShowCompleteModal(false);

      if (!showCompleteModal) {
        toast.success("Perfil atualizado com sucesso!");
      }

    } catch (error: any) {
      console.error("Erro na atualização:", error);
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : "Erro ao salvar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const updatedProfile = await DonorService.updateProfile(formData as any);
      setProfileImage(updatedProfile.avatarUrl ?? null);
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      toast.error("Erro ao salvar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "canceled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed": return "Concluída";
      case "pending": return "Pendente";
      case "canceled": return "Cancelada";
      default: return status;
    }
  };

  const totalDonations = donationHistory.length;
  const totalAmount = donationHistory
    .filter(d => d.donationType === "monetary" && d.donationStatus === "completed")
    .reduce((sum, d) => sum + (Number(d.monetaryAmount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Componente que renderiza os toasts na tela */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <div className="relative w-full h-48 bg-gradient-to-r from-purple-600 to-indigo-700">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full z-30 shadow-sm text-white hover:bg-white hover:text-purple-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <label
              htmlFor="profile-upload"
              className="absolute bottom-1 right-1 bg-purple-600 p-2.5 rounded-full cursor-pointer hover:bg-purple-700 transition-all shadow-lg border-2 border-white text-white"
            >
              <Camera size={16} />
            </label>
            <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
          </div>
        </div>
      </div>

      {/* RESUMO */}
      <div className="mt-20 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{donorData.name || "Doador"}</h1>
        <p className="text-gray-500 font-medium">{donorData.email}</p>

        <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 text-rose-500 mb-1">
              <Heart size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Doações</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
              <DollarSign size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Investido</p>
          </motion.div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-8 px-6">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "info" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "history" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Histórico
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 px-6 space-y-4 max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Sobre você</h2>

                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingProfile(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={20} /></button>
                    <button onClick={handleUpdateInfo} disabled={isLoading} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit2 size={16} /> Editar Perfil
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Biografia */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><FileText size={20} className="text-gray-400" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Biografia</p>
                    {isEditingProfile ? (
                      <textarea
                        className="w-full mt-1 px-3 py-2 border rounded-xl outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                        placeholder="Conte um pouco sobre você..."
                        value={donorData.description}
                        onChange={(e) => setDonorData({ ...donorData, description: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-700 italic leading-relaxed">
                        {donorData.description || "Nenhuma biografia informada."}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="border-gray-50" />

                {/* Nome e Telefone */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><User size={20} className="text-gray-400" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nome Completo</p>
                    {isEditingProfile ? (
                      <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" value={donorData.name} onChange={(e) => setDonorData({ ...donorData, name: e.target.value })} />
                    ) : (
                      <p className="font-medium text-gray-900">{donorData.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <MapPin size={20} className="text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
                      Endereço
                    </p>

                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        {/* CEP */}
                        <input
                          placeholder="CEP"
                          className="col-span-2 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.zipCode}
                          onChange={handleCepChange}
                        />

                        {/* Rua */}
                        <input
                          placeholder="Rua"
                          className="col-span-2 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.street}
                          onChange={(e) =>
                            setAddress({ ...address, street: e.target.value })
                          }
                        />

                        {/* Número */}
                        <input
                          placeholder="Número"
                          className="px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.number}
                          onChange={(e) =>
                            setAddress({ ...address, number: e.target.value })
                          }
                        />

                        {/* Complemento */}
                        <input
                          placeholder="Complemento"
                          className="px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.complement}
                          onChange={(e) =>
                            setAddress({ ...address, complement: e.target.value })
                          }
                        />

                        {/* Bairro */}
                        <input
                          placeholder="Bairro"
                          className="col-span-2 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.neighborhood}
                          onChange={(e) =>
                            setAddress({ ...address, neighborhood: e.target.value })
                          }
                        />

                        {/* Cidade */}
                        <input
                          placeholder="Cidade"
                          className="px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                        />

                        {/* Estado */}
                        <input
                          placeholder="Estado"
                          className="px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100"
                          value={address.state}
                          onChange={(e) =>
                            setAddress({ ...address, state: e.target.value })
                          }
                        />
                      </div>
                    ) : address.street ? (
                      <p className="text-gray-900 leading-relaxed">
                        {address.street}, {address.number || "S/N"} <br />
                        {address.neighborhood} - {address.city}/{address.state}
                      </p>
                    ) : (
                      <p className="text-gray-400">Não informado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><Phone size={20} className="text-gray-400" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Telefone / WhatsApp</p>
                    {isEditingProfile ? (
                      <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" value={donorData.phone} onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })} />
                    ) : (
                      <p className="font-medium text-gray-900">{donorData.phone || "Não informado"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="p-2 bg-gray-50 rounded-lg"><Mail size={20} className="text-gray-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email da Conta</p>
                    <p className="font-medium text-gray-900">{donorData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="p-2 bg-gray-50 rounded-lg"><AlertCircle size={20} className="text-gray-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">CPF</p>
                    <p className="font-medium text-gray-900">{donorData.cpf}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 px-6 space-y-4 max-w-2xl mx-auto pb-10"
          >
            {isHistoryLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Buscando suas doações...</p>
              </div>
            ) : donationHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <History size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Você ainda não realizou doações.</p>
              </div>
            ) : (
              donationHistory.map((donation) => (
                <motion.div
                  key={donation.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${donation.donationType === "monetary" ? "bg-emerald-50" : "bg-blue-50"}`}>
                        {donation.donationType === "monetary" ? (
                          <DollarSign size={20} className="text-emerald-600" />
                        ) : (
                          <Package size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{donation.ong?.user?.name || "Instituição"}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(donation.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(donation.donationStatus)}`}>
                      {getStatusText(donation.donationStatus)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-50">
                    {donation.donationType === "monetary" ? (
                      <MonetaryDonationDetails amount={`R$ ${Number(donation.monetaryAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    ) : (
                      <MaterialDonationDetails items={donation.materialDescription || "Itens diversos"} />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}