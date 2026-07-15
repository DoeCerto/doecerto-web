"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Home from "@/components/specific/Home/home";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenReady, setTokenReady] = useState(false); // Estado para controlar a renderização

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      router.replace("/home");
      setTokenReady(true); // Token salvo, pode renderizar
    } else if (localStorage.getItem("access_token")) {
      setTokenReady(true); // Token já existe no storage, pode renderizar
    }
  }, [searchParams, router]);

  // Enquanto o token não for processado, não renderizamos o componente que busca dados
  if (!tokenReady) {
    return <div>Carregando...</div>; 
  }

  return (
    <div>
      <Home />
    </div>
  );
}