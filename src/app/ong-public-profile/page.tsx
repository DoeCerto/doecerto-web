"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OngPublicProfile from "@/components/specific/Ong-Public-Profile/ong-public-profile";


function OngProfileLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-400">
        Nenhum ID de ONG foi encontrado.
      </div>
    );
  }

  return <OngPublicProfile ongId={Number(id)} />;
}

export default function OngPublicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#6B39A7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <OngProfileLoader />
    </Suspense>
  );
}
