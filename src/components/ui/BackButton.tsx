"use client";

import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  onClick?: () => void;
};

export default function BackButton({
  onClick,
}: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        items-center
        gap-[10px]
        py-[10px]
        px-[25px]
        bg-[#EBD2FF]
        text-[#6B39A7]
        text-[16px]
        font-bold
        rounded-[10px]
        transition
        hover:opacity-90
      "
    >
      <ArrowLeft size={20} />

      Voltar
    </button>
  );
}