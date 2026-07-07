"use client";

import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";

interface ImageUploaderProps {
  image: string;
  onImageChange: (file: File) => void;
  variant: "banner" | "logo";
  label?: string;
}

export function ImageUploader({
  image,
  onImageChange,
  variant,
  label,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageChange(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // =========================
  // BANNER
  // =========================
  if (variant === "banner") {
    return (
      <div className="relative w-full aspect-[1.8/1] sm:aspect-[2.5/1] lg:aspect-[3.5/1] xl:aspect-[4/1] overflow-hidden bg-gray-100 border-b border-purple-100">
        {preview || image ? (
          <img
            src={preview || image}
            alt="Banner"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-[50%_35%]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-violet-50 to-pink-100" />
        )}

        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition">
          <div className="bg-white/90 p-2.5 sm:p-3 rounded-full shadow-lg mb-2 backdrop-blur-md">
            <Camera className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <span className="text-[#6B39A7] font-bold text-[9px] sm:text-xs uppercase tracking-wider bg-white/60 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/40">
            {preview || image ? "Alterar Capa" : label || "Adicionar Capa"}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInternalChange}
            accept="image/*"
          />
        </label>
      </div>
    );
  }

  // =========================
  // LOGO
  // =========================

  return (
    <div className="relative z-10 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 ml-3 sm:ml-6 md:ml-8 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40">
      <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border-[3px] sm:border-4 border-white shadow-xl bg-gradient-to-tr from-purple-100 via-violet-50 to-pink-100 flex items-center justify-center">
        {preview || image ? (
          <img
            src={preview || image}
            alt="Logo"
            draggable={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-purple-600/70">
            <Camera className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase mt-1">
              {label || "Logo"}
            </span>
          </div>
        )}

        <label className="absolute inset-0 flex items-center justify-center bg-purple-600/10 backdrop-blur-[2px] cursor-pointer opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity">
          <Camera className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />

          <input
            type="file"
            className="hidden"
            onChange={handleInternalChange}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
}
