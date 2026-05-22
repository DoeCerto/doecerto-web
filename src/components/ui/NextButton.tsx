"use client";

import { ArrowRight, Check } from "lucide-react";

type NextButtonProps = {
  onClick?: () => void;
  text?: string;
  isFinish?: boolean;
};

export default function NextButton({
  onClick,
  text = "Próximo",
  isFinish = false,
}: NextButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        items-center
        gap-[10px]
        py-[10px]
        px-[25px]
        bg-[#6B39A7]
        text-white
        text-[16px]
        font-bold
        rounded-[10px]
        transition
        hover:opacity-90
      "
    >
      {text}

      {isFinish ? (
        <Check size={20} strokeWidth={3} />
      ) : (
        <ArrowRight size={20} />
      )}
    </button>
  );
}