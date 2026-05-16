"use client";

import { ArrowRight } from "lucide-react";

type NextButtonProps = {
  onClick?: () => void;
};

export default function NextButton({ onClick }: NextButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[10px] py-[10px] px-[25px] bg-[#6B39A7] text-white text-[16px] font-bold rounded-[10px] transition hover:opacity-90"
    >
      Próxima
      <ArrowRight size={20} />
    </button>
  );
}