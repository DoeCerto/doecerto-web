"use client";

import React from "react";
import { 
  PawPrint, 
  Utensils, 
  GraduationCap, 
  HeartPulse, 
  HandHeart, 
  Sprout, 
  Palette, 
  Scale, 
  Building, 
  Home, 
  Activity, 
  Cpu, 
  Sparkles,
  Package,
  Shirt,
  BookOpen
} from "lucide-react";

interface CategoryImpactIconProps {
  category?: string | null;
  className?: string;
  size?: number;
}

export function CategoryImpactIcon({ category, className = "w-5 h-5", size = 20 }: CategoryImpactIconProps) {
  const norm = (category || "").toLowerCase().trim();

  if (norm.includes("animal") || norm.includes("pet") || norm.includes("resgatado") || norm.includes("ração")) {
    return <PawPrint size={size} className={className} />;
  }
  if (norm.includes("aliment") || norm.includes("refeição") || norm.includes("fome") || norm.includes("comida") || norm.includes("cesta")) {
    return <Utensils size={size} className={className} />;
  }
  if (norm.includes("educa") || norm.includes("escola") || norm.includes("estud") || norm.includes("aluno")) {
    return <GraduationCap size={size} className={className} />;
  }
  if (norm.includes("saúde") || norm.includes("saude") || norm.includes("médic") || norm.includes("paciente") || norm.includes("remédio")) {
    return <HeartPulse size={size} className={className} />;
  }
  if (norm.includes("assistência") || norm.includes("assistencia") || norm.includes("vulnerab") || norm.includes("social") || norm.includes("família")) {
    return <HandHeart size={size} className={className} />;
  }
  if (norm.includes("meio ambiente") || norm.includes("árvore") || norm.includes("natureza") || norm.includes("muda") || norm.includes("ecol")) {
    return <Sprout size={size} className={className} />;
  }
  if (norm.includes("cultura") || norm.includes("arte") || norm.includes("música")) {
    return <Palette size={size} className={className} />;
  }
  if (norm.includes("direito") || norm.includes("justiça") || norm.includes("human")) {
    return <Scale size={size} className={className} />;
  }
  if (norm.includes("comunit") || norm.includes("desenvolvimento")) {
    return <Building size={size} className={className} />;
  }
  if (norm.includes("moradia") || norm.includes("lar") || norm.includes("habita")) {
    return <Home size={size} className={className} />;
  }
  if (norm.includes("esporte") || norm.includes("lazer") || norm.includes("atl")) {
    return <Activity size={size} className={className} />;
  }
  if (norm.includes("tecnologia") || norm.includes("inova") || norm.includes("digital") || norm.includes("comput")) {
    return <Cpu size={size} className={className} />;
  }
  if (norm.includes("roupa") || norm.includes("agasalho") || norm.includes("vestu")) {
    return <Shirt size={size} className={className} />;
  }
  if (norm.includes("livro") || norm.includes("caderno") || norm.includes("didát")) {
    return <BookOpen size={size} className={className} />;
  }
  if (norm.includes("material") || norm.includes("item") || norm.includes("pacote")) {
    return <Package size={size} className={className} />;
  }

  return <Sparkles size={size} className={className} />;
}
