"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaBuilding } from "react-icons/fa";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function RegisterChoicePage() {
  const [selected, setSelected] = useState<"doa" | "ong">("doa");
  const router = useRouter();

  const handleNavigate = () => {
    if (selected === "doa") {
      router.push("/register");
    } else {
      router.push("/ong-register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white font-sans px-6">
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/login"
          className="flex items-center gap-2 text-white font-bold text-base hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} strokeWidth={3} />
          <span className="hidden xs:inline">Voltar</span>
        </Link>
      </div>
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="mb-2">
          <Image
            src="/logo.svg"
            alt="DoeCerto"
            width={220}
            height={80}
            priority
            className="w-full h-auto"
          />
        </div>
      </div>
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-3">Novo por aqui?</h1>
        <p className="text-base mb-8 text-purple-100">
          Cadastre-se agora mesmo como ONG ou Doador.
        </p>

        {/* Botões de seleção  */}
        <div className="flex w-full bg-white rounded-md p-[2px] mb-6 shadow-inner">
          <button
            onClick={() => setSelected("doa")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-lg font-bold rounded-md transition-all duration-200
              ${
                selected === "doa"
                  ? "bg-[#6B39A7] text-white scale-[0.97] shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]"
                  : "text-[#6B39A7] bg-transparent hover:bg-purple-50"
              }`}
          >
            <FaUser size={18} />
            DOADOR
          </button>

          <button
            onClick={() => setSelected("ong")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-lg font-bold rounded-md transition-all duration-200
              ${
                selected === "ong"
                  ? "bg-[#6B39A7] text-white scale-[0.97] shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]"
                  : "text-[#6B39A7] bg-transparent hover:bg-purple-50"
              }`}
          >
            <FaBuilding size={18} />
            ONG
          </button>
        </div>

        {/* Texto descritivo */}
        <div className="min-h-[80px] flex items-start justify-center">
          <p className="text-base mb-8 px-2 leading-snug transition-opacity duration-300">
            {selected === "doa"
              ? "Como doador, você pode contribuir para diversas causas e acompanhar o impacto de suas doações."
              : "Como ONG, você pode cadastrar suas campanhas e receber doações para apoiar suas causas."}
          </p>
        </div>

        {/* Botão principal */}
        <button
          onClick={handleNavigate}
          className="w-60 mx-auto flex justify-center items-center text-2xl bg-white text-[#6B39A7] font-bold py-2 rounded-md border-2 border-white transition-all duration-300 hover:shadow-xl hover:shadow-[#6B39A7]/40 hover:-translate-y-1 active:scale-95 mb-8 cursor-pointer"
        >
          Continuar como {selected === "doa" ? "Doador" : "ONG"}
        </button>
      </div>
    </div>
  );
}
