"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { DonorService, type UpdateProfileDTO, type DonationHistory } from "@/services/donor.service";

interface AddressData {
  id: number;
  donorId: number | null;
  ongId: number | null;
  createdAt: string;
  updatedAt: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

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

  const [donorData, setDonorData] = useState({
    name: "Carregando...",
    email: "",
    cpf: "",
    phone: "",
    description: "",
    address: {
      id: 0,
      donorId: null,
      ongId: null,
      createdAt: "",
      updatedAt: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    } as AddressData
  });

  const normalizeAddress = (addr: any): AddressData => {
    return {
      id: addr?.id || 0,
      donorId: addr?.donorId || null,
      ongId: addr?.ongId || null,
      createdAt: addr?.createdAt || "",
      updatedAt: addr?.updatedAt || "",
      street: addr?.street || "",
      number: addr?.number || "",
      complement: addr?.complement || "",
      neighborhood: addr?.neighborhood || "",
      city: addr?.city || "",
      state: addr?.state || "",
      zipCode: addr?.zipCode || "",
    };
  };

  const getCleanAddress = (address: AddressData) => {
    const { id, createdAt, updatedAt, donorId, ongId, ...rest } = address;
    return rest;
  };

  // CARREGAR PERFIL, HISTÓRICO E ENDEREÇO
  useEffect(() => {
    async function loadAllData() {
      try {
        setIsLoading(true);
        setIsHistoryLoading(true);
        
        const [profile, history, address] = await Promise.all([
          DonorService.getMyProfile(),
          DonorService.getDonationHistory(),
          DonorService.getMyAddress() 
        ]);

        setDonorData({
          name: profile.name || "",
          email: profile.email || "",
          cpf: profile.cpf || "",
          phone: profile.phone || "",
          description: profile.description || "",
          address: normalizeAddress(address || profile.address)
        });

        setDonationHistory(history);

        if (profile.avatarUrl) setProfileImage(profile.avatarUrl);
        if (!profile.phone) setShowCompleteModal(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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

      // 2. Atualizar Perfil
      const profilePayload: UpdateProfileDTO = {
        contactNumber: donorData.phone,
        description: donorData.description || "",
      };
      await DonorService.updateProfile(profilePayload);

      // 3. Atualizar/Criar Endereço com Validação
      if (donorData.address && donorData.address.street) {
        const { street, number, neighborhood, city, state, zipCode } = donorData.address;

        // Verifica se os campos obrigatórios estão preenchidos antes de enviar
        if (!street || !number || !neighborhood || !city || !state || !zipCode) {
          alert("Por favor, preencha todos os campos do endereço.");
          setIsLoading(false);
          return;
        }

        const cleanAddress = getCleanAddress(donorData.address);

        if (donorData.address.id > 0) {
          await DonorService.updateAddress(donorData.address.id, cleanAddress as any);
        } else {
          await DonorService.createAddress(cleanAddress as any);
        }
      }

      // 4. Recarregar dados
      const freshData = await DonorService.getMyProfile();
      setDonorData({
        ...freshData,
        address: normalizeAddress(freshData.address || donorData.address)
      });

      setIsEditingProfile(false);
      setShowCompleteModal(false);

      if (!showCompleteModal) {
        alert("Perfil atualizado com sucesso!");
      }

    } catch (error: any) {
      console.error("Erro na atualização:", error);
      const msg = error.response?.data?.message;
      alert(Array.isArray(msg) ? msg[0] : "Erro ao salvar os dados.");
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
    } catch (error) {
      alert("Erro ao salvar imagem.");
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

      {/* MODAL PARA COMPLETAR TELEFONE */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Só mais um detalhe!</h2>
                <p className="text-gray-500 mb-6">As ONGs precisam do seu telefone para combinar a entrega das doações materiais.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Seu Telefone / WhatsApp</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="(00) 00000-0000"
                        value={donorData.phone}
                        onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateInfo}
                  disabled={isLoading || !donorData.phone}
                  className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Salvar e Continuar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                {/* ENDEREÇO */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><MapPin size={20} className="text-gray-400" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Endereço</p>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100 col-span-2" placeholder="Rua" value={donorData.address.street} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, street: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" placeholder="Número" value={donorData.address.number} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, number: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" placeholder="Complemento" value={donorData.address.complement} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, complement: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100 col-span-2" placeholder="Bairro" value={donorData.address.neighborhood} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, neighborhood: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" placeholder="Cidade" value={donorData.address.city} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, city: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100" placeholder="UF" value={donorData.address.state} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, state: e.target.value } })} />
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border-gray-100 col-span-2" placeholder="CEP" value={donorData.address.zipCode} onChange={(e) => setDonorData({ ...donorData, address: { ...donorData.address, zipCode: e.target.value } })} />
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900 leading-relaxed">
                        {donorData.address.street
                          ? `${donorData.address.street}, ${donorData.address.number} ${donorData.address.complement ? '- ' + donorData.address.complement : ''}\n${donorData.address.neighborhood}, ${donorData.address.city}/${donorData.address.state} - CEP: ${donorData.address.zipCode}`
                          : "Endereço não informado"}
                      </p>
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