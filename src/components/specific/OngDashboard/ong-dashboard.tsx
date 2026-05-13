"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Heart, Award, X, Instagram, Phone, Home, Star, Pencil,
  History, Package, CheckCircle2, Clock, FileText, ArrowLeft,
  Loader2, Camera, AlertCircle, ArrowRight, Tag, MessageSquare, AlertTriangle, ExternalLink,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { DonationService } from "@/services/donations.service";
import { api } from "@/services/api";


interface OngDashboardProps {
  ong?: any;
}

export default function OngDashboard({ ong: initialOng }: OngDashboardProps) {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [loading, setLoading] = useState(!initialOng);
  const [ong, setOng] = useState<any>(initialOng);
  const [reviews, setReviews] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);


  const [confirmModal, setConfirmModal] = useState<{ id: number; type: 'accept' | 'reject' } | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const donorPhone = selectedDonation?.donor?.profile?.contactNumber ?? "";

  const message = encodeURIComponent(
    `Olá! Sou da ONG ${ong?.name}. Sobre a doação de itens que você enviou.`
  );

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  const cleanPhone = donorPhone.replace(/\D/g, "");

  const whatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}?text=${message}`
    : null;

  async function loadData() {
    try {
      const profileData = await OngsProfileService.getMyProfile();
      setOng(profileData);

      if (profileData.id) {
        const [reviewsRes, donationsData] = await Promise.all([
          api(`/ongs/${profileData.id}/ratings`),
          DonationService.getReceivedDonations()
        ]);

        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        setDonations(donationsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;

    const { id, type } = confirmModal;

    try {
      setLoading(true);

      if (type === 'accept') {
        await DonationService.acceptDonation(id);
      } else {
        await DonationService.rejectDonation(id);
      }

      setConfirmModal(null);

      setSelectedDonation(null);

      setIsHistoryOpen(false);

      await loadData();

      console.log(`Doação ${type === 'accept' ? 'aceita' : 'rejeitada'} com sucesso!`);

    } catch (error: any) {
      console.error("Erro ao processar ação:", error);

      const errorMessage = error.response?.data?.message || "Não foi possível atualizar o status da doação.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!ong || !ong.description) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-[#4a1d7a]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Complete seu Perfil</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">Sua ONG ainda não possui as informações configuradas. Complete seu perfil para começar a receber doações.</p>
          <button onClick={() => router.push('/ong-profilesetup')} className="w-full bg-[#4a1d7a] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
            Configurar agora <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32">
      {/* Header / Banner */}
      <div className="relative w-full h-[220px] sm:h-[360px] bg-gray-100 border-b border-purple-100 flex items-center justify-center">
        {ong.bannerUrl ? (
          <motion.img
            src={ong.bannerUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: ong.bannerPosition || "50% 50%"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            alt="Banner da ONG"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-violet-50 to-pink-100" />
        )}

        {/* Botões de Ação no Topo */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <motion.button
            onClick={() => router.push(`/ong-profilesetup`)}
            className="flex items-center gap-2 bg-white border-2 border-[#4a1d7a] px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-[#4a1d7a] shadow-sm hover:bg-purple-50 transition-colors text-xs sm:text-base"
          >
            <Pencil size={16} /> <span>Editar Perfil</span>
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 border-2 border-red-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-red-600 shadow-sm hover:bg-red-100 transition-colors text-xs sm:text-base"
          >
            <LogOut size={16} /> <span>Sair</span>
          </motion.button>
        </div>

        {/* Foto de Perfil */}
        <motion.div
          className="absolute -bottom-14 left-6 sm:left-10 z-50 w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center"
        >
          {ong.avatarUrl ? (
            <img
              src={ong.avatarUrl}
              className="w-full h-full object-cover"
              alt={ong.name}
            />
          ) : (
            <div className="w-full h-full bg-[#4a1d7a] flex items-center justify-center">
              <span className="text-white text-4xl sm:text-5xl font-black">
                {ong.name?.charAt(0) || 'O'}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Conteúdo Abaixo do Header */}
      <div className="px-4 sm:px-10 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {ong.name || "Minha ONG"}
        </h1>

        <div className="text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm sm:text-lg font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin size={18} className="text-red-400" />
            {ong.address?.city || "Localização não definida"}
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={18} className="text-blue-400" />
            {ong.yearsOfOperation
              ? `${ong.yearsOfOperation} ${ong.yearsOfOperation === 1 ? 'ano' : 'anos'} de atuação`
              : (ong.displayYears || "Tempo não informado")}
          </span>
        </div>

        {/* --- CATEGORIAS --- */}
        {ong.categories && ong.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ong.categories.map((cat: any, idx: number) => (
              <span key={cat.id || idx} className="px-3 py-1 bg-purple-50 text-[#4a1d7a] border border-purple-100 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                <Tag size={12} className="text-purple-400" /> {cat.name || cat}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-[#4a1d7a]">Sobre</h2>
            <p className="mt-3 text-gray-700 text-sm sm:text-lg leading-relaxed">{ong.description || "Nenhuma descrição informada ainda."}</p>
            <div className="mt-5 pt-5 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-3 text-gray-600"><Phone size={18} className="text-[#4a1d7a]" /><span className="text-sm sm:text-base font-bold">{ong.contactNumber || "Não informado"}</span></div>
              <div className="flex items-center gap-3 text-gray-600"><Instagram size={18} className="text-pink-600" /><span className="text-sm sm:text-base font-bold text-gray-900 break-all">{ong.website || "Não informado"}</span></div>
              <div className="flex items-start gap-3 text-gray-600"><Home size={18} className="text-blue-600 mt-0.5" /><span className="text-sm sm:text-base font-bold">{ong.address ? `${ong.address.city} - ${ong.address.state}` : "Endereço não informado"}</span></div>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-[#4a1d7a] mb-4">Gestão e Estatísticas</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-gray-50 text-center border border-gray-200">
                <Heart size={20} className="mx-auto text-pink-500" fill="currentColor" />
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">{donations.length || 0}</p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-tight">Doações</p>
              </div>

              <button onClick={() => setIsReviewsOpen(true)} className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-yellow-50 text-center border border-yellow-100 hover:bg-yellow-100 transition-all cursor-pointer">
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= Math.floor(ong.stats?.ratingAverage || 0) ? "#facc15" : "transparent"} className={s <= Math.floor(ong.stats?.ratingAverage || 0) ? "text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">{(ong.stats?.ratingAverage || 0).toFixed(1)}</p>
                <p className="text-[10px] sm:text-sm text-yellow-700 font-bold uppercase tracking-tight underline">Avaliações</p>
              </button>

              <button onClick={() => setIsHistoryOpen(true)} className="w-full md:w-auto md:flex-1 p-3 sm:p-4 rounded-lg bg-purple-50 text-center border border-purple-100 hover:bg-purple-100 transition-all">
                <History size={20} className="mx-auto text-[#4a1d7a]" />
                <p className="mt-1 text-base sm:text-xl font-bold text-[#4a1d7a]">Histórico</p>
                <p className="text-[10px] sm:text-sm text-purple-600 font-bold uppercase tracking-tight">Ver Doações</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE HISTÓRICO --- */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-t-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold">Doações Recebidas</h3>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-900"><X size={18} /></button>
              </div>
              <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {donations.length > 0 ? donations.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        {item.type === "monetary" ? <Heart size={20} className="text-green-500 mt-1" fill="currentColor" /> : <Package size={20} className="text-blue-500 mt-1" />}
                        <div>
                          <p className="font-bold text-gray-900 text-base">{item.type === "monetary" ? "Doação em Dinheiro" : "Doação de Material"}</p>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{item.type === "monetary" ? `Valor: R$ ${item.amount}` : item.materialDescription}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase shrink-0 ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : item.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status === 'COMPLETED' ? 'Recebido' : item.status === 'CANCELED' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2">
                      <button
                        onClick={() => {
                          console.log("DOACAO:", item);
                          setSelectedDonation(item);
                        }}
                        className="flex-1 py-2 bg-purple-50 text-[#4a1d7a] text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                        <FileText size={14} /> Ver Detalhes
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-gray-500">
                    <History size={40} className="mx-auto mb-2 opacity-20" />
                    <p>Nenhuma doação registrada.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE DETALHES DA DOAÇÃO (COMPROVANTE) --- */}
      <AnimatePresence>
        {selectedDonation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 text-gray-900">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedDonation(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-700" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${selectedDonation.type === 'monetary' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {selectedDonation.type === 'monetary' ? <Heart fill="currentColor" /> : <Package />}
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-gray-900 leading-tight">Detalhes da Doação</h4>
                    <p className="text-sm text-gray-500 font-medium">Protocolo #{selectedDonation.id}</p>
                  </div>
                </div>

                {/* PARTE DO COMPROVANTE CONFIGURADA PARA ZOOM INTERNO (MELHOR PARA CELULAR) */}
                {selectedDonation.type === 'monetary' && (
                  <div className="bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 p-2 mb-6">
                    {selectedDonation.proofUrl ? (
                      <div className="relative group">
                        <img
                          src={
                            selectedDonation.proofUrl.startsWith('http')
                              ? selectedDonation.proofUrl
                              : `${API_URL}/${selectedDonation.proofUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`
                          }
                          alt="Comprovante"
                          className="w-full h-48 object-cover rounded-[18px] shadow-sm cursor-zoom-in"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Erro+ao+carregar+imagem";
                          }}
                          onClick={() => {
                            const fullUrl = selectedDonation.proofUrl.startsWith('http')
                              ? selectedDonation.proofUrl
                              : `${API_URL}/${selectedDonation.proofUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`;
                            setZoomImage(fullUrl);
                          }}
                        />

                        <button
                          onClick={() => {
                            const fullUrl = selectedDonation.proofUrl.startsWith('http')
                              ? selectedDonation.proofUrl
                              : `${API_URL}/${selectedDonation.proofUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`;
                            setZoomImage(fullUrl);
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold rounded-[18px] backdrop-blur-[2px]"
                        >
                          <ExternalLink size={20} /> Ver em tela cheia
                        </button>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Camera size={40} strokeWidth={1} />
                        <p className="text-xs font-medium">Comprovante não enviado</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {selectedDonation?.type !== "monetary" && whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
                    >
                      <ExternalLink size={18} />
                      Falar com o doador no WhatsApp
                    </a>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500 font-bold">Doador</span>
                    <span className="text-sm text-gray-900 font-black">{selectedDonation.donor?.user?.name || 'Não identificado'}</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500 font-bold block mb-1">
                      {selectedDonation.type === 'monetary' ? 'Descrição do Pagamento' : 'Itens Doados'}
                    </span>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      {selectedDonation.type === 'monetary'
                        ? `Transferência de R$ ${selectedDonation.amount}`
                        : selectedDonation.materialDescription}
                    </p>
                  </div>

                  {selectedDonation.type !== 'monetary' && selectedDonation.materialQuantity && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-blue-50">
                      <span className="text-sm text-gray-500 font-bold">Quantidade de Itens</span>
                      <span className="text-sm text-blue-600 font-black">{selectedDonation.materialQuantity}</span>
                    </div>
                  )}
                </div>

                {/* LÓGICA DOS BOTÕES DE AÇÃO */}
                {selectedDonation.status === 'PENDING' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal({ id: selectedDonation.id, type: 'reject' })}
                      className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => setConfirmModal({ id: selectedDonation.id, type: 'accept' })}
                      className="flex-1 py-4 bg-[#4a1d7a] text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#3a1661] transition-all"
                    >
                      Aceitar Doação
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6 text-gray-900">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xs rounded-[32px] p-6 shadow-2xl text-center border border-gray-100">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.type === 'accept' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {confirmModal.type === 'accept' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
              </div>
              <h4 className="text-xl font-black text-gray-900">Confirmação</h4>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Deseja {confirmModal.type === 'accept' ? 'aceitar' : 'rejeitar'} esta doação? Esta ação não pode ser desfeita.</p>
              <div className="flex flex-col gap-2 mt-6">
                <button onClick={handleConfirmAction} className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95 ${confirmModal.type === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Sim, continuar</button>
                <button onClick={() => setConfirmModal(null)} className="w-full py-3.5 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- OVERLAY DE ZOOM (TELA CHEIA PARA CELULAR) --- */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-2 backdrop-blur-sm"
          >
            <button
              className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setZoomImage(null);
              }}
            >
              <X size={32} />
            </button>

            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={zoomImage}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              alt="Comprovante ampliado"
              onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-10 text-white/60 font-medium text-sm">
              Toque fora para fechar
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE AVALIAÇÕES --- */}
      <AnimatePresence>
        {isReviewsOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm text-gray-900">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-t-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-yellow-50">
                <h3 className="text-lg font-bold flex items-center gap-2"><Star className="text-yellow-500" fill="currentColor" size={20} /> O que dizem sobre nós</h3>
                <button onClick={() => setIsReviewsOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-900"><X size={18} /></button>
              </div>
              <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {reviews.length > 0 ? reviews.map((r, index) => (
                  <div key={r.id || index} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#4a1d7a]">{r.donor?.user?.name || "Doador"}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < (r.score || 0) ? "#facc15" : "transparent"} className={i < (r.score || 0) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{r.comment || "Sem comentário."}"</p>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Sua ONG ainda não recebeu avaliações.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}