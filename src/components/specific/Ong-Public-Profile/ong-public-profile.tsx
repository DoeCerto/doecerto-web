"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Heart,
  Award,
  Instagram,
  Phone,
  Home,
  Star,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  X,
  Tag,
  Globe,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { OngsProfileService } from "@/services/ongs-profile.service";

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
  const [data, setData] = useState<{
    ong: OngProfileData;
    reviews: Review[];
  } | null>(null);
  const [errors, setErrors] = useState({ banner: false, logo: false });

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

  useEffect(() => {
    loadData();
  }, [ongId]);

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
      {/* Banner Section */}
      <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[340px] bg-gray-200">
        {ong.banner && !errors.banner ? (
          <motion.img
            src={ong.banner}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onError={() => setErrors((prev) => ({ ...prev, banner: true }))}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 p-2 rounded-full z-30 shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <motion.div className="absolute -bottom-8 left-6 z-50 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
          {ong.logo && !errors.logo ? (
            <img
              src={ong.logo}
              className="w-full h-full object-cover"
              alt="Logo"
              onError={() => setErrors((prev) => ({ ...prev, logo: true }))}
            />
          ) : (
            <span className="text-3xl font-black text-[#6B39A7]">
              {ong.name?.charAt(0).toUpperCase() || "O"}
            </span>
          )}
        </motion.div>
      </div>

      <div className="px-6 mt-14 sm:mt-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#002B49] leading-tight">
          {ong.name}
        </h1>

        {/* --- LOCALIZAÇÃO E ANOS --- */}
        <div className="text-gray-400 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium items-center">
          <span className="flex items-center gap-1.5">
            <MapPin size={18} className="text-red-400" />{" "}
            {ong.address || "Endereço não informado"}
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={18} className="text-blue-400" />{" "}
            {ong.yearsOfOperation
              ? `${ong.yearsOfOperation} ${ong.yearsOfOperation === 1 ? "ano" : "anos"} de atuação`
              : "Ano de atuação não informado"}
          </span>
        </div>

        {/* --- CATEGORIAS --- */}
        {ong.categories && ong.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {ong.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-purple-50 text-[#6B39A7] border border-purple-100 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm"
              >
                <Tag size={12} className="text-purple-400" />
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* --- RATING (ESTRELA) LOGO ABAIXO DAS CATEGORIAS --- */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-xl">
            <Star size={18} fill="#facc15" className="text-yellow-400" />
            <span className="text-yellow-700 font-bold text-sm">
              {ong.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4">
          <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-[#6B39A7]">Sobre</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              {ong.description}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
              <ContactInfo
                icon={<Phone size={16} className="text-[#6B39A7]" />}
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
                  <ExternalLink size={16} className="text-pink-600" />
                  Visitar página oficial
                </a>
              ) : (
                <div className="flex items-center gap-3 text-gray-600 text-sm font-bold">
                  <ExternalLink size={16} className="text-gray-400" />
                  <span>Site não informado</span>
                </div>
              )}
              <ContactInfo
                icon={<Home size={16} className="text-blue-600" />}
                text={ong.address}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-[#6B39A7] mb-3">
              Estatísticas
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <StatItem
                icon={<MessageSquare size={18} className="text-blue-500" />}
                value={ong.numberOfRatings}
                label="Feedbacks"
              />
              <StatItem
                icon={
                  <Heart
                    size={18}
                    className="text-pink-500"
                    fill="currentColor"
                  />
                }
                value={ong.donations}
                label="Doações"
              />
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 active:scale-95 transition-all hover:bg-yellow-100 shadow-sm"
              >
                <Star
                  size={18}
                  fill="#facc15"
                  className="mx-auto text-yellow-400 mb-1"
                />
                <p className="text-xs font-black text-yellow-700 uppercase">
                  Avaliar
                </p>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-[#6B39A7] mb-4">
              Comentários de Doadores
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {reviews.length > 0 ? (
                reviews.map((rev, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-50 pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">
                        {rev.donor?.user?.name || "Doador"}
                      </span>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={10}
                            fill={idx < rev.score ? "currentColor" : "none"}
                            className={idx < rev.score ? "" : "text-gray-200"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      "{rev.comment || "Sem comentário."}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Ninguém avaliou ainda. Seja o primeiro!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-[999]">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-2xl active:scale-95 transition-transform"
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

      <AnimatePresence>
        {isReviewModalOpen && (
          <ReviewPostModal
            ongId={ongId}
            onClose={() => setIsReviewModalOpen(false)}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ContactInfo({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600 text-sm font-bold">
      <div className="shrink-0">{icon}</div>
      <span className="truncate">{text || "Não informado"}</span>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 text-center border border-gray-100">
      <div className="mx-auto mb-1 flex justify-center">{icon}</div>
      <p className="text-xl font-black text-gray-900">{value || 0}</p>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
        {label}
      </p>
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
      alert("Erro ao enviar avaliação.");
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
          className="w-full py-4 bg-[#6B39A7] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center"
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
