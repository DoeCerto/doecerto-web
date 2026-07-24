"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Heart,
  Award,
  Phone,
  Home,
  Star,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  X,
  Tag,
  ExternalLink,
  CheckCircle2,
  Clock,
  User, 
} from "lucide-react";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { DonorService } from "@/services/donor.service"; 
import toast, { Toaster } from "react-hot-toast"; 

// --- INTERFACES PARA TYPESCRIPT ---
export interface Review {
  score: number;
  comment: string;
  createdAt: string;
  donor: { user: { name: string } };
}

export interface OngProfileData {
  id: number;
  name: string;
  banner: string;
  logo: string;
  description: string;
  phone: string;
  website?: string[];
  address: string;
  distance: string;
  yearsOfOperation: number;
  numberOfRatings: number;
  rating: number;
  donations: number;
  categories: any[];
}

export default function OngPublicProfile({ ongId }: { ongId: number }) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showDonateFirstModal, setShowDonateFirstModal] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null); // null = verificando
  const [data, setData] = useState<{
    ong: OngProfileData;
    reviews: Review[];
  } | null>(null);
  const [errors, setErrors] = useState({ banner: false, logo: false });

  // Estados para verificação de perfil incompleto
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Carrega os dados da ONG e reviews
  const loadData = async () => {
    if (!ongId) return;
    try {
      const result = await OngsProfileService.getPublicProfile(ongId);
      setData({
        ong: {
          ...result,
          categories: result.categories.map((c: any) =>
            typeof c === "string" ? c : c.name,
          ),
        },
        reviews: result.reviews || [],
      });
    } catch (err) {
      console.error("❌ Erro ao carregar perfil:", err);
    }
  };

  // Verifica se o usuário logado pode avaliar
  const checkDonationStatus = async () => {
    try {
      const hasDonated = await OngsProfileService.hasDonatedToOng(ongId);
      setCanReview(hasDonated);
    } catch (err) {
      console.error(err);
      setCanReview(false);
    }
  };

  // 1. Verifica se o perfil do doador está incompleto ao montar a tela
  useEffect(() => {
    async function checkUserProfile() {
      try {
        const userRole = localStorage.getItem("userRole")?.toUpperCase();
        // Apenas doadores precisam fornecer telefone
        if (userRole !== "ONG") {
          const profile = await DonorService.getMyProfile();
          const isIncomplete = profile.isNewProfile || !profile.phone;
          setIsProfileIncomplete(isIncomplete);
        }
      } catch (err) {
        console.error("Erro ao verificar perfil do usuário:", err);
      }
    }
    checkUserProfile();
  }, []);

  useEffect(() => {
    loadData();
    checkDonationStatus();
  }, [ongId]);

  // Intercepta a abertura do modal de doação se o perfil estiver incompleto
  function openDonateModal() {
    if (isProfileIncomplete) {
      setShowProfileModal(true);
    } else {
      setIsModalOpen(true);
    }
  }

  // Envia a atualização do telefone do doador
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
      
      // Prossiga com a abertura do modal de doação após salvar
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Erro ao salvar telefone. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewButtonClick = () => {
    if (canReview) {
      setIsReviewModalOpen(true);
    } else {
      setShowDonateFirstModal(true);
    }
  };

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[#6B39A7] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">
            Carregando perfil...
          </span>
        </div>
      </div>
    );

  const { ong, reviews } = data;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-36 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Banner Section — mesma proporção do dashboard */}
      <div className="relative mb-16 sm:mb-20 lg:mb-24">
        <div className="relative w-full aspect-[1.8/1] sm:aspect-[2.5/1] lg:aspect-[3.5/1] xl:aspect-[4/1] overflow-hidden bg-gray-100 border-b border-purple-100">
          {ong.banner && !errors.banner ? (
            <motion.img
              src={ong.banner}
              className="absolute inset-0 w-full h-full object-cover object-[50%_35%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onError={() => setErrors((prev) => ({ ...prev, banner: true }))}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-violet-50 to-pink-100 flex items-center justify-center">
              <ImageIcon size={40} className="text-gray-400" />
            </div>
          )}

          <button
            onClick={() => router.back()}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 p-2 rounded-full z-30 shadow-md hover:bg-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Logo — mesmo tamanho e posição do dashboard */}
        <motion.div className="absolute left-4 sm:left-6 md:left-8 bottom-0 translate-y-1/2 z-50">
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-[3px] sm:border-4 border-white shadow-xl bg-white flex items-center justify-center">
            {ong.logo && !errors.logo ? (
              <img
                src={ong.logo}
                className="w-full h-full object-cover"
                alt="Logo"
                onError={() => setErrors((prev) => ({ ...prev, logo: true }))}
              />
            ) : (
              <div className="w-full h-full bg-[#6B39A7] flex items-center justify-center">
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-black">
                  {ong.name?.charAt(0).toUpperCase() || "O"}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-4 sm:px-10">
        {/* Nome + estrela na mesma linha — igual ao dashboard com nome + localização */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {ong.name}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-xl shrink-0">
            <Star size={16} fill="#facc15" className="text-yellow-400" />
            <span className="text-yellow-700 font-bold text-sm">
              {ong.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>

        {/* Localização e anos — mesmo estilo do dashboard */}
        <div className="text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm sm:text-lg font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin size={18} className="text-red-400" />
            {ong.address || "Endereço não informado"}
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={18} className="text-blue-400" />
            {ong.yearsOfOperation
              ? `${ong.yearsOfOperation} ${ong.yearsOfOperation === 1 ? "ano" : "anos"} de atuação`
              : "Ano de atuação não informado"}
          </span>
        </div>

        {/* Categorias — mesmo estilo do dashboard */}
        {ong.categories && ong.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ong.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-50 text-[#6B39A7] border border-purple-100 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm"
              >
                <Tag size={12} className="text-purple-400" />
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4">
          {/* Card Sobre */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-[#6B39A7]">
              Sobre
            </h2>
            <p className="mt-3 text-gray-700 text-sm sm:text-lg leading-relaxed">
              {ong.description}
            </p>
            <div className="mt-5 pt-5 border-t border-gray-50 space-y-4">
              <ContactInfo
                icon={<Phone size={18} className="text-[#6B39A7]" />}
                text={ong.phone}
              />
              {ong.website &&
              Array.isArray(ong.website) &&
              ong.website.length > 0 ? (
                <a
                  href={
                    ong.website[0].startsWith("http")
                      ? ong.website[0]
                      : `https://${ong.website[0]}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm sm:text-base font-bold text-[#6B39A7] underline break-all"
                >
                  <ExternalLink size={16} className="text-pink-600 shrink-0" />
                  Visitar página oficial
                </a>
              ) : (
                <div className="flex items-center gap-3 text-gray-600 text-sm font-bold">
                  <ExternalLink size={16} className="text-gray-400 shrink-0" />
                  <span>Site não informado</span>
                </div>
              )}
              <ContactInfo
                icon={<Home size={18} className="text-blue-600" />}
                text={ong.address}
              />
            </div>
          </div>

          {/* Card Estatísticas */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-[#6B39A7] mb-4">
              Estatísticas
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-gray-50 text-center border border-gray-200">
                <MessageSquare size={20} className="mx-auto text-blue-500" />
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">
                  {ong.numberOfRatings || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-tight">
                  Feedbacks
                </p>
              </div>

              <div className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-gray-50 text-center border border-gray-200">
                <Heart
                  size={20}
                  className="mx-auto text-pink-500"
                  fill="currentColor"
                />
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">
                  {ong.donations || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-tight">
                  Doações
                </p>
              </div>

              <button
                onClick={handleReviewButtonClick}
                disabled={canReview === null}
                title={
                  canReview === false
                    ? "Você precisa doar para esta ONG antes de avaliar"
                    : undefined
                }
                className="flex-1 min-w-[100px] p-3 sm:p-4 rounded-lg bg-yellow-50 text-center border border-yellow-100 hover:bg-yellow-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      fill={
                        s <= Math.floor(ong.rating || 0)
                          ? "#facc15"
                          : "transparent"
                      }
                      className={
                        s <= Math.floor(ong.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900">
                  {(ong.rating || 0).toFixed(1)}
                </p>
                <p className="text-[10px] sm:text-sm text-yellow-700 font-bold uppercase tracking-tight underline">
                  Avaliar
                </p>
              </button>
            </div>
          </div>

          {/* Card Comentários */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Star
                size={20}
                fill="#facc15"
                className="text-yellow-400 shrink-0"
              />
              <h3 className="text-lg sm:text-xl font-bold text-[#6B39A7]">
                O que dizem sobre nós
              </h3>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {reviews.length > 0 ? (
                reviews.map((rev, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">
                        {rev.donor?.user?.name || "Doador Anônimo"}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={13}
                            fill={idx < rev.score ? "#facc15" : "transparent"}
                            className={
                              idx < rev.score
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {rev.comment || "Sem comentário enviado."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Star size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Ninguém avaliou ainda.</p>
                  <p className="text-sm mt-1">
                    Seja o primeiro a deixar um comentário!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botão fixo de doação — Aciona a checagem de cadastro primeiro */}
      <div className="fixed bottom-6 left-6 right-6 z-[999]">
        <button
          onClick={openDonateModal}
          className="w-full py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-2xl active:scale-95 transition-transform cursor-pointer"
        >
          Doar para esta ONG
        </button>
      </div>

      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={() => router.push(`/pix?id=${ong.id}`)}
          onDonateItems={() =>
            router.push(
              `/donation?ongId=${ong.id}&ong=${encodeURIComponent(ong.name)}`,
            )
          }
        />
      )}

      {/* Modal de completar cadastro integrado */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowProfileModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 flex flex-col items-center text-center border border-gray-100"
            >
              {/* Botão de Fechar */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-8 border border-purple-100/50">
                <User size={44} className="text-[#6B39A7]" />
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
                    className="w-full pl-20 pr-4 py-5 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B39A7] transition-all"
                    value={phone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setPhone(numericValue);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleCompleteRegistration}
                    disabled={isSaving}
                    className="w-full bg-[#6B39A7] hover:bg-[#55278d] text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-100 active:scale-[0.98] transition-all text-lg disabled:opacity-70 cursor-pointer"
                  >
                    {isSaving ? "Salvando..." : "Salvar e Continuar"}
                  </button>

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-semibold py-3 rounded-2xl transition-all text-sm cursor-pointer"
                  >
                    Talvez mais tarde
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewModalOpen && (
          <ReviewPostModal
            ongId={ongId}
            onClose={() => setIsReviewModalOpen(false)}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDonateFirstModal && (
          <DonateFirstModal
            onClose={() => setShowDonateFirstModal(false)}
            onDonate={() => {
              setShowDonateFirstModal(false);
              openDonateModal(); 
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ContactInfo({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <div className="shrink-0">{icon}</div>
      <span className="text-sm sm:text-base font-bold truncate">
        {text || "Não informado"}
      </span>
    </div>
  );
}

function DonateFirstModal({
  onClose,
  onDonate,
}: {
  onClose: () => void;
  onDonate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-8 shadow-2xl relative text-center overflow-hidden border border-gray-100"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Ícone Principal */}
        <div className="mx-auto w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-4 text-pink-500 shadow-sm">
          <Heart size={32} fill="currentColor" />
        </div>

        {/* Título */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 tracking-tight px-2 leading-snug">
          Falta bem pouquinho para poder avaliar!
        </h3>

        {/* Contexto & Regras */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
          Para garantir a autenticidade das avaliações, você precisa ter:
        </p>

        {/* Caixa de Requisitos */}
        <div className="bg-gray-50 rounded-2xl p-3.5 sm:p-5 text-left space-y-3 sm:space-y-4 mb-5 border border-gray-100">
          <div className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
            <CheckCircle2
              size={20}
              className="text-green-500 mt-0.5 flex-shrink-0"
            />
            <span className="leading-normal">
              Feito pelo menos uma doação para esta ONG.
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
            <CheckCircle2
              size={20}
              className="text-green-500 mt-0.5 flex-shrink-0"
            />
            <span className="leading-normal">
              Ter a doação aprovada e aceita por eles.
            </span>
          </div>
        </div>

        {/* Caixa de Tranquilização */}
        <div className="bg-amber-50 rounded-2xl p-3.5 sm:p-5 flex items-start gap-3 text-left mb-6 border border-amber-100">
          <Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-wide">
              Já fez sua doação?
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
              Fique tranquilo! Se você já doou, a ONG está apenas processando o
              recebimento. Assim que eles aprovarem, você poderá deixar sua
              avaliação aqui.
            </p>
          </div>
        </div>

        {/* Ação Principal */}
        <button
          onClick={onDonate}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all duration-200"
        >
          Fazer uma doação agora
        </button>
      </motion.div>
    </div>
  );
}

function ReviewPostModal({
  ongId,
  onClose,
  onSuccess,
}: {
  ongId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await OngsProfileService.postReview(ongId, score, comment);
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.status === 403) {
        toast.error(
          "Você precisa ter feito uma doação para esta ONG para poder avaliá-la.",
        );
      } else {
        toast.error("Erro ao enviar avaliação.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-black text-center text-[#6B39A7] mb-2">
          Sua Nota
        </h3>
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={32}
              onClick={() => setScore(s)}
              fill={s <= score ? "#facc15" : "transparent"}
              className={`${s <= score ? "text-yellow-400" : "text-gray-200"} cursor-pointer transition-colors`}
            />
          ))}
        </div>
        <textarea
          className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm h-28 focus:ring-2 focus:ring-purple-500 outline-none mb-4 resize-none"
          placeholder="Escreva um breve depoimento..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-[#6B39A7] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Enviar Avaliação"
          )}
        </button>
      </motion.div>
    </div>
  );
}