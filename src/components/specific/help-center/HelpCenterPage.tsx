"use client";

import { useRouter } from "next/navigation";
import ActionCard from "@/components/ui/HelpCenterActionCard";
import InfoCard from "@/components/ui/InfoCard";
import StepIntro from "@/components/ui/StepIntro"
import { X, ClipboardList, Star, Heart, User } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";

export default function HelpCenterPage() {
  const router = useRouter();

  return (
    <main>
      <div className="p-[25px] w-full bg-[#6B39A7] text-white px-6 flex flex-col">

        <div className="flex justify-end">
          <button
            onClick={() => router.push("/home")}
            className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-white"
          >
            <X
              size={16}
              strokeWidth={3}
              className="text-[#6B39A7]"
            />
          </button>
        </div>

        <h1 className="text-2xl font-semibold mt-3 mb-3">
          Como podemos te ajudar?
        </h1>

        <div className="flex items-center gap-3 bg-white shadow-sm rounded-xl px-3 py-2">
          <FiSearch className="text-gray-400" />
          <input
            // value={query}
            // onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise uma ONG, cidade ou causa"
            className="w-full outline-none text-base text-gray-400"
          />
        </div>

      </div>

      <div className="p-[25px]">
        <h1 className="text-[20px] font-extrabold mb-3 text-[#6B39A7]">
          DOAÇÕES
        </h1>


        <div className="flex gap-4 flex-row">
          <Link href="/donation-guide">
            <ActionCard
              icon="💰"
              title="Como doar dinheiro"
              description="Pix e boleto"
            />
          </Link>

          <ActionCard
            icon="📦"
            title={
              <>
                Como doar <br /> dinheiro
              </>
            }
            description="Ração, roupas e mais"
          />
        </div>

        <div className="flex flex-col mt-[30px]">
          <h1 className="text-[20px] font-extrabold mb-3 text-[#6B39A7]">
            HISTÓRICO E AVALIAÇÕES
          </h1>

          <InfoCard
            icon={<ClipboardList className="w-[30px] h-[25px] fill-[#FFFFFF]" />}
            title="Ver histórico de doações"
            description="Tudo que você já doou"
          />
          <InfoCard
            icon={<Star className="w-[30px] h-[25px] fill-[#FFD700]" />}
            title="Avaliar uma ONG"
            description="Comentários e estrelas"
          />
        </div>

        <div className="flex flex-col mt-[22px]">
          <h1 className="text-[20px] font-extrabold mb-3 text-[#6B39A7]">
            ONGS E DESCOBERTAS
          </h1>

          <InfoCard
            icon={<FiSearch className="w-[30px] h-[25px]" strokeWidth={3} />}
            title="Buscar e filtrar ONGs"
            description="Encontre a causa certa"
          />
          <InfoCard
            icon={<Heart className="w-[30px] h-[25px] fill-[#FF0000]" />}
            title="Favoritar ONGs"
            description="Salve as que você mais gosta"
          />
        </div>

        <div className="flex flex-col mt-[22px]">
          <h1 className="text-[20px] font-extrabold mb-3 text-[#6B39A7]">
            CONTA
          </h1>

          <InfoCard
            icon={<User className="w-[30px] h-[25px]" />}
            title="Perfil e configurações"
            description="Dados pessoais e senha"
          />
          <InfoCard
            icon={<svg width="30" height="25" viewBox="0 0 24 24">
              {/* Alça */}
              <path
                d="M7 10V7a5 5 0 0110 0v3"
                stroke="#333333"
                strokeWidth="3"
                fill="none"
              />

              {/* Corpo */}
              <rect
                x="2"
                y="10"
                width="20"
                height="15"
                rx="2"
                fill="#FFA500"
              />
            </svg>}
            title="Segurança e privacidade"
            description="Como seus dados são usados"
          />
        </div>
      </div>
    </main>
  );
}