"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, HeartHandshake, Award, Phone, Home,
  Star, ArrowLeft, Image as ImageIcon, MessageSquare, X, Tag,
  Globe, CheckCircle2, Copy, Heart, Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import DonateModal from "@/components/specific/DonateModal";
import { OngsProfileService } from "@/services/ongs-profile.service";

// --- INTERFACES ---
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
  instagram: string;
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
  const [data, setData] = useState<{ ong: OngProfileData; reviews: Review[] } | null>(null);
  const [errors, setErrors] = useState({ banner: false, logo: false });

  const loadData = async () => {
    if (!ongId) return;
    try {
      const result = await OngsProfileService.getPublicProfile(ongId);
      setData({
        ong: {
          ...result,
          categories: result.categories.map((c: any) => (typeof c === 'string' ? c : c.name))
        },
        reviews: result.reviews || []
      });
    } catch (err) {
      console.error("❌ Erro ao carregar perfil:", err);
    }
  };

  useEffect(() => { loadData(); }, [ongId]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { ong, reviews } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-36 font-sans text-slate-900">
      {/* Banner Section - Responsivo */}
      <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] bg-slate-200">
        {ong.banner && !errors.banner ? (
          <img src={ong.banner} className="w-full h-full object-cover" alt="Capa" onError={() => setErrors(prev => ({ ...prev, banner: true }))} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-300">
            <ImageIcon size={48} className="text-slate-400" />
          </div>
        )}

        <button onClick={() => router.back()} className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-white/90 p-2.5 sm:p-3 rounded-full z-30 shadow-sm hover:bg-white transition-all active:scale-95 cursor-pointer">
          <ArrowLeft size={24} className="text-purple-600" />
        </button>
      </div>

      {/* Container Principal Centralizado */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10 flex flex-col gap-4 sm:gap-6">

        {/* CARTÃO 1: Perfil da ONG + Estatísticas */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center">

          {/* Logo - Escalonada */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl shadow-md mb-4 sm:mb-6 flex items-center justify-center overflow-hidden bg-slate-100 border-4 border-white ring-1 ring-slate-100 shrink-0">
            {ong.logo && !errors.logo ? (
              <img src={ong.logo} className="w-full h-full object-cover" alt="Logo" onError={() => setErrors(prev => ({ ...prev, logo: true }))} />
            ) : (
              <span className="text-4xl sm:text-5xl font-black text-purple-600">{ong.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Nome da ONG e Selo de Verificação Lado a Lado */}
          <div className="flex items-center justify-center gap-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-none">
              {ong.name}
            </h1>

            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              src="/iconeselo.svg"
              alt="Selo DoeCerto"
              title="ONG Verificada Oficialmente"
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 lg:translate-y-[5px] xl:translate-y-[5px] shrink-0 drop-shadow-sm cursor-help sm:translate-y-[4px] translate-x-[-4px] translate-y-[3px] sm:translate-x-[-3px] md:translate-x-[-4px]" 
            />
          </div>

          <div className="text-slate-500 mt-4 sm:mt-6 flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm lg:text-base font-semibold items-center">
            <span className="flex items-center gap-1.5 sm:gap-2"><MapPin size={16} className="text-purple-600 sm:w-[18px]" /> {ong.address || "Localização não informada"}</span>
            <span className="flex items-center gap-1.5 sm:gap-2"><Award size={16} className="text-purple-600 sm:w-[18px]" /> {ong.yearsOfOperation} Anos de atuação</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-5 sm:mt-6">
            {ong.categories.map((cat, idx) => (
              <span key={idx} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 text-purple-600 text-[11px] sm:text-xs lg:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                <Tag size={12} className="text-purple-400 sm:w-[14px]" /> {cat}
              </span>
            ))}
          </div>

          {/* Painel de Estatísticas - Responsivo */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100">
            <StatItem icon={<Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="#facc15" />} value={ong.rating?.toFixed(1) || "0.0"} label="Nota Geral" />
            <StatItem icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />} value={ong.numberOfRatings} label="Feedbacks" />
            <StatItem icon={<HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />} value={ong.donations} label="Doações" />
          </div>
        </div>

        {/* CARTÃO 2: Ações */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="text-center md:text-left w-full">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">Faça a diferença hoje</h3>
              <p className="text-sm sm:text-base text-slate-500 mt-1.5 sm:mt-2 font-medium">Seu apoio ajuda a ONG a continuar seu trabalho incrível.</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-4 shrink-0">
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-slate-200 rounded-2xl text-slate-600 text-sm sm:text-base font-bold hover:border-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer hover:scale-105 active:scale-95 text-center"
              >
                Avaliar ONG
              </button>

              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-purple-600 text-white text-sm sm:text-base font-black rounded-2xl shadow-md hover:bg-purple-500 hover:scale-105 cursor-pointer transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                <Heart size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
                Doar Agora
              </button>
            </div>
          </div>
        </div>

        {/* CARTÃO 3: Sobre */}
        <div className="p-5 sm:p-8 lg:p-10 rounded-3xl bg-white shadow-sm border border-slate-100">
          <h2 className="text-lg sm:text-xl font-black text-purple-600 mb-4 sm:mb-6">Sobre a instituição</h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed">{ong.description}</p>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <ContactInfo icon={<Phone size={18} className="text-purple-600 sm:w-5 sm:h-5" />} text={ong.phone} copyable />
            <ContactInfo icon={<Globe size={18} className="text-purple-600 sm:w-5 sm:h-5" />} text={ong.instagram} />
            <ContactInfo icon={<Home size={18} className="text-slate-600 sm:w-5 sm:h-5" />} text={ong.address} />
          </div>
        </div>

        {/* CARTÃO 4: Comentários */}
        <div className="p-5 sm:p-8 lg:p-10 rounded-3xl bg-white shadow-sm border border-slate-100">
          <h3 className="text-lg sm:text-xl font-black text-purple-600 mb-4 sm:mb-6">Comentários de Doadores</h3>
          <div className="space-y-3 sm:space-y-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
            {reviews.length > 0 ? reviews.map((rev, i) => (
              <div key={i} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <span className="font-bold text-sm sm:text-base text-slate-800">{rev.donor?.user?.name || "Doador"}</span>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={12} className="sm:w-[14px] sm:h-[14px]" fill={idx < rev.score ? "currentColor" : "none"} color={idx < rev.score ? "currentColor" : "#e5e7eb"} />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic">"{rev.comment || "Sem comentário."}"</p>
              </div>
            )) : <p className="text-slate-400 text-center py-4 sm:py-6 text-sm sm:text-base font-medium">Nenhum comentário ainda. Seja o primeiro a avaliar!</p>}
          </div>
        </div>

      </div>

      {isModalOpen && (
        <DonateModal
          onClose={() => setIsModalOpen(false)}
          onDonateMoney={() => router.push(`/pix?id=${ong.id}`)}
          onDonateItems={() => router.push(`/donation?ongId=${ong.id}&ong=${encodeURIComponent(ong.name)}`)}
        />
      )}

      <AnimatePresence>
        {isReviewModalOpen && <ReviewPostModal ongId={ongId} onClose={() => setIsReviewModalOpen(false)} onSuccess={loadData} />}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ContactInfo({ icon, text, copyable }: { icon: React.ReactNode, text: string, copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text || text === "Não informado") return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between text-slate-700 text-xs sm:text-sm lg:text-base font-bold bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="shrink-0">{icon}</div>
        <span className="truncate">{text || "Não informado"}</span>
      </div>
      {copyable && text && text !== "Não informado" && (
        <button
          onClick={handleCopy}
          title="Copiar"
          className="flex-shrink-0 ml-2 sm:ml-3 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer hover:bg-slate-200 active:scale-95 text-slate-400 hover:text-purple-600"
        >
          {copied ? <CheckCircle2 size={16} className="text-green-600 sm:w-[18px]" /> : <Copy size={16} className="sm:w-[18px]" />}
        </button>
      )}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number | string, label: string }) {
  return (
    <div className="p-3 sm:p-4 lg:p-6 rounded-2xl bg-slate-50 text-center border border-slate-100 flex flex-col items-center justify-center transition-all hover:bg-slate-100">
      <div className="mb-1.5 sm:mb-3">{icon}</div>
      <p className="text-lg sm:text-xl lg:text-3xl font-black text-slate-900">{value}</p>
      <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 sm:mt-1.5 truncate w-full px-1">{label}</p>
    </div>
  );
}

function ReviewPostModal({ ongId, onClose, onSuccess }: { ongId: number, onClose: () => void, onSuccess: () => void }) {
  const [score, setScore] = useState(0); // Começa zerado para forçar a escolha
  const [hoveredScore, setHoveredScore] = useState(0); // Para o efeito de acender as estrelas
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas antes de enviar.");
      return;
    }

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
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col"
      >
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header do Modal com UX Writing */}
        <div className="text-center mb-6 mt-2">
          <h3 className="text-xl sm:text-2xl font-black text-[#3b1a66]">
            Avalie a Instituição
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed px-2">
            Sua opinião ajuda a dar mais transparência e credibilidade para o trabalho da ONG.
          </p>
        </div>

        {/* Estrelas Interativas com borda fina (strokeWidth={1.5}) */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHoveredScore(s)}
              onMouseLeave={() => setHoveredScore(0)}
              onClick={() => setScore(s)}
              className="transition-transform hover:scale-110 active:scale-95 cursor-pointer p-1"
            >
              <Star 
                size={36} 
                strokeWidth={1.5}
                className="sm:w-10 sm:h-10 transition-colors duration-200" 
                fill={s <= (hoveredScore || score) ? "#facc15" : "transparent"} 
                color={s <= (hoveredScore || score) ? "#facc15" : "#cbd5e1"} 
              />
            </button>
          ))}
        </div>

        {/* Feedback visual da nota */}
        <div className="text-center h-4 mb-4">
          <span className="text-sm font-bold text-yellow-500 uppercase tracking-widest">
            {score === 1 && "Muito Ruim"}
            {score === 2 && "Ruim"}
            {score === 3 && "Razoável"}
            {score === 4 && "Muito Bom"}
            {score === 5 && "Excelente!"}
          </span>
        </div>

        {/* Textarea Premium */}
        <div className="relative mb-6">
          <textarea 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 sm:p-5 text-sm sm:text-base h-28 sm:h-32 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 outline-none resize-none transition-all placeholder:text-slate-400" 
            placeholder="Conte o que achou do trabalho da ONG..." 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
          />
        </div>

        {/* Botão de Envio com Ícone Send e Animação */}
        <button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full py-4 bg-purple-600 text-white text-sm sm:text-base font-black rounded-2xl shadow-md hover:bg-purple-500 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2.5 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              Enviar Avaliação
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}